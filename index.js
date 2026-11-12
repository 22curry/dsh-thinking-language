/**
 * Thinking language for DeepSeek Harness.
 *
 * The model's chain of thought is produced by the model itself, so the only
 * place where its language can be chosen is the request that starts it: this
 * plugin contributes one short system-prompt section that names the language
 * the model must reason in. Nothing is translated after the fact, no extra
 * request is made, and the visible reply keeps following the user's language.
 *
 * The choice lives in this plugin's own configuration, so it is profile-wide:
 * new and existing Sessions, every workspace, and every Agent that inherits
 * the Host prompt all read the same value, and it survives restarts.
 */
import z from './vendor/schemastery/lib/index.mjs'

/** Language code -> the English name written into the instruction. */
export const LANGUAGES = Object.freeze({
  zh: 'Chinese',
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  pt: 'Portuguese',
  it: 'Italian',
  ru: 'Russian',
  ar: 'Arabic',
  hi: 'Hindi',
  th: 'Thai',
  vi: 'Vietnamese',
  tr: 'Turkish',
  id: 'Indonesian',
})

/** Longest accepted custom language name, in UTF-16 code units. */
const CUSTOM_LIMIT = 80

export const name = 'thinking-language'

export const inject = ['systemPrompt']

export const Config = z.object({
  language: z
    .string()
    .default('follow')
    .description(
      'Language code the model reasons in, or "custom" to use the custom value, or "follow" to leave the model alone.',
    )
    .volatile(),
  custom: z
    .string()
    .default('')
    .description('Language name used when language is "custom", for example "Norwegian".')
    .volatile(),
})

/**
 * Read a configuration field that may be a live volatile reference or a plain
 * default value (schemas keep defaults as ordinary data).
 * @param field - the field value handed to `apply`.
 * @param fallback - value used when the field is absent or not a string.
 * @returns the current string value.
 */
function readField(field, fallback) {
  if (field !== null && typeof field === 'object' && typeof field.get === 'function') {
    const live = field.get()
    return typeof live === 'string' ? live : fallback
  }
  return typeof field === 'string' ? field : fallback
}

/**
 * Resolve the configured language into the phrase used by the instruction.
 * @param language - configured language code.
 * @param custom - configured custom language name.
 * @returns the language phrase, or an empty string when nothing should be sent.
 */
export function languageLabel(language, custom) {
  if (language === 'follow') return ''
  if (language === 'custom') {
    return String(custom ?? '')
      .replace(/[\r\n\t]+/g, ' ')
      .trim()
      .slice(0, CUSTOM_LIMIT)
  }
  return LANGUAGES[language] ?? ''
}

/**
 * Clause naming the language the reasoning must not fall back to. Naming the
 * failure mode explicitly (the model's default English) is what makes the rule
 * survive a conversation whose earlier reasoning was already English.
 * @param label - the required language.
 * @returns a sentence fragment, empty when the required language is English.
 */
function fallbackClause(label) {
  if (label === 'English') return ''
  return ' Never fall back to English or to the conversation language, not even for a short or trivial request.'
}

/**
 * Build the system-prompt section body for one configuration snapshot.
 * @param language - configured language code.
 * @param custom - configured custom language name.
 * @returns the section text, empty when no instruction should be sent.
 */
export function instruction(language, custom) {
  const label = languageLabel(language, custom)
  if (label === '') return ''
  return [
    '## Thinking language',
    '',
    `Write every reasoning block in ${label}. This covers each step — planning, intermediate notes, and self-checks — on every message, however short.${fallbackClause(label)} Ignore the language that earlier reasoning in this conversation used; only the reply the user reads follows the user's own language.`,
  ].join('\n')
}

/**
 * Build the short reminder that rides the runtime-context snapshot immediately
 * before a request, so the rule is the last thing the model reads.
 * @param language - configured language code.
 * @param custom - configured custom language name.
 * @returns the reminder text, empty when no instruction should be sent.
 */
export function reminder(language, custom) {
  const label = languageLabel(language, custom)
  if (label === '') return ''
  return `Reasoning language: ${label}. Every reasoning block in this turn is written in ${label}.${fallbackClause(label)}`
}

export function apply(ctx, config) {
  const snapshot = () => [readField(config?.language, 'follow'), readField(config?.custom, '')]
  const text = () => instruction(...snapshot())
  const context = () => reminder(...snapshot())

  // The last section of the assembled prompt, after the deployment persona
  // suffix. An empty text removes the section entirely, so the default choice
  // costs nothing.
  ctx.systemPrompt.section({
    name: 'thinking-language',
    order: 10300,
    interpolate: false,
    text,
  })

  // A required runtime-context contribution renders as a sourced user-role
  // snapshot immediately before the request, which is the strongest position
  // for a style rule and survives presets that suppress optional context. An
  // empty text is dropped from the snapshot like any other empty context.
  ctx.systemPrompt.context({
    name: 'thinking-language',
    order: 900,
    interpolate: false,
    required: true,
    text: context,
  })
}
