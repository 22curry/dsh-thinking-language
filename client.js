/**
 * Browser half of dsh-thinking-language.
 *
 * Registers one settings page (Settings → Thinking language) and the same
 * control on the bundle's Plugins page. Both read and write the Host entry
 * `thinking-language` through the shared configuration-form service, so the
 * value is stored by the Host in the profile patch: it applies to every
 * Session and workspace and survives a restart. No request leaves the machine.
 */
window.__ModuleLoader__.load({
  id: 'dsh-thinking-language',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useReducer, useState, useSyncExternalStore } = React

    /** Host entry id declared by cordis.patch.yml; also the settings namespace. */
    const ENTRY = 'thinking-language'
    /** Bundle package name, the key the Plugins page dispatches. */
    const PACKAGE = 'dsh-thinking-language'

    /** Language choices, in the order the selector lists them. */
    const LANGUAGES = [
      { value: 'follow' },
      { value: 'zh', label: '中文' },
      { value: 'en', label: 'English' },
      { value: 'ja', label: '日本語' },
      { value: 'ko', label: '한국어' },
      { value: 'de', label: 'Deutsch' },
      { value: 'fr', label: 'Français' },
      { value: 'es', label: 'Español' },
      { value: 'pt', label: 'Português' },
      { value: 'it', label: 'Italiano' },
      { value: 'ru', label: 'Русский' },
      { value: 'ar', label: 'العربية' },
      { value: 'hi', label: 'हिन्दी' },
      { value: 'th', label: 'ไทย' },
      { value: 'vi', label: 'Tiếng Việt' },
      { value: 'tr', label: 'Türkçe' },
      { value: 'id', label: 'Bahasa Indonesia' },
    ]

    const EN = {
      nav: 'Thinking language',
      title: 'Thinking language',
      description:
        'The language the model reasons in. It changes the thinking only — the reply you read keeps following your language.',
      field: 'Reason in',
      follow: 'Follow the conversation (default)',
      custom: 'Other language…',
      customPlaceholder: 'e.g. Norwegian, Cantonese',
      apply: 'Apply',
      note: 'Applies to every Session, workspace and Agent, and is remembered after a restart.',
      reading: 'Reading the saved choice…',
      unavailable: 'This profile does not expose the setting, so it cannot be changed here.',
      readonly: 'This profile does not allow saving from the browser.',
      saving: 'Saving…',
      failed: 'Not saved. The Host refused the change; the previous choice stays active.',
      summary: 'Reasoning language',
    }

    const ZH = {
      nav: '思考语言',
      title: '思考语言',
      description: '模型思考（reasoning）时使用的语言。只改变思考过程，你看到的回答仍跟随你的语言。',
      field: '用哪种语言思考',
      follow: '跟随对话（默认）',
      custom: '其他语言…',
      customPlaceholder: '例如：挪威语、粤语',
      apply: '应用',
      note: '对所有会话、工作区与代理生效，重启 DSH 后依然保留。',
      reading: '正在读取已保存的选择…',
      unavailable: '当前 profile 没有暴露这项配置，无法在这里修改。',
      readonly: '当前 profile 不允许从浏览器保存。',
      saving: '正在保存…',
      failed: '保存失败：Host 拒绝了这次修改，仍沿用之前的选择。',
      summary: '思考语言',
    }

    /**
     * Pick the active UI language from the Client locale service, falling back
     * to the document language the locale service writes on <html>.
     * @param ctx - client plugin context.
     * @returns `zh` or `en`.
     */
    function detectLocale(ctx) {
      const fromService = () => {
        const locale = ctx.locale
        if (!locale) return ''
        const snapshot = typeof locale.getSnapshot === 'function' ? locale.getSnapshot() : undefined
        const candidates = [
          snapshot && typeof snapshot === 'object' ? snapshot.id : undefined,
          snapshot && typeof snapshot === 'object' ? snapshot.locale : undefined,
          snapshot && typeof snapshot === 'object' ? snapshot.active : undefined,
          snapshot && typeof snapshot === 'object' ? snapshot.language : undefined,
          typeof snapshot === 'string' ? snapshot : undefined,
        ]
        const found = candidates.find((value) => typeof value === 'string' && value !== '')
        return found || ''
      }
      let id = ''
      try {
        id = fromService()
      } catch {
        id = ''
      }
      if (id === '') {
        try {
          id = document.documentElement.lang || navigator.language || ''
        } catch {
          id = ''
        }
      }
      return id.toLowerCase().startsWith('zh') ? 'zh' : 'en'
    }

    /** Re-render the panel when the active UI language changes. */
    function useLocaleTick(ctx) {
      const [, bump] = useReducer((count) => count + 1, 0)
      useEffect(() => {
        const locale = ctx.locale
        if (!locale || typeof locale.subscribe !== 'function') return undefined
        return locale.subscribe(() => bump())
      }, [ctx])
    }

    const styles = {
      wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        maxWidth: '560px',
        color: 'var(--dsw-alias-label-primary)',
        fontSize: '13px',
        lineHeight: '1.6',
      },
      title: { margin: '0', fontSize: '15px', fontWeight: 600, lineHeight: '1.3' },
      description: { margin: '0', color: 'var(--dsw-alias-label-secondary)' },
      label: { display: 'block', marginBottom: '6px', fontWeight: 500 },
      select: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-primary)',
        font: 'inherit',
        fontSize: '13px',
      },
      row: { display: 'flex', gap: '8px', alignItems: 'center' },
      input: {
        flex: '1 1 auto',
        minWidth: '0',
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-primary)',
        font: 'inherit',
        fontSize: '13px',
      },
      button: {
        flex: '0 0 auto',
        padding: '8px 14px',
        borderRadius: '8px',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-2)',
        color: 'var(--dsw-alias-label-primary)',
        font: 'inherit',
        fontSize: '13px',
        cursor: 'pointer',
      },
      hint: { margin: '0', color: 'var(--dsw-alias-label-secondary)', fontSize: '12px' },
      error: { margin: '0', color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' },
      summary: { display: 'flex', gap: '6px', color: 'var(--dsw-alias-label-secondary)', fontSize: '13px' },
    }

    /**
     * One page used by both entry points.
     * @param props - client context, the shared config form, and the view mode.
     * @returns the settings page or its one-line summary.
     */
    function Panel({ ctx, form, view }) {
      useLocaleTick(ctx)
      const t = detectLocale(ctx) === 'zh' ? ZH : EN

      const subscribe = useCallback((listener) => form.subscribe(listener), [form])
      const getSnapshot = useCallback(() => form.getSnapshot(), [form])
      const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

      const value = snapshot && typeof snapshot.value === 'object' && snapshot.value !== null ? snapshot.value : {}
      const current = typeof value.language === 'string' ? value.language : 'follow'
      const savedCustom = typeof value.custom === 'string' ? value.custom : ''
      const [draft, setDraft] = useState(savedCustom)
      const [saving, setSaving] = useState(false)
      const [failed, setFailed] = useState(false)

      useEffect(() => {
        setDraft(savedCustom)
      }, [savedCustom])

      const writable = Boolean(snapshot && snapshot.writable) && snapshot.status !== 'unavailable'
      const busy = saving || (snapshot && snapshot.status === 'loading')

      const write = useCallback(
        async (operations) => {
          if (!writable) return
          setSaving(true)
          setFailed(false)
          try {
            const accepted = await form.mutate(operations)
            if (!accepted) setFailed(true)
          } catch {
            setFailed(true)
          } finally {
            setSaving(false)
          }
        },
        [form, writable],
      )

      const choose = useCallback(
        (next) => {
          if (next === current) return
          if (next === 'custom') {
            void write([
              { op: 'set', path: ['language'], value: 'custom' },
              { op: 'set', path: ['custom'], value: draft.trim() },
            ])
            return
          }
          void write([{ op: 'set', path: ['language'], value: next }])
        },
        [current, draft, write],
      )

      const applyCustom = useCallback(() => {
        void write([
          { op: 'set', path: ['language'], value: 'custom' },
          { op: 'set', path: ['custom'], value: draft.trim() },
        ])
      }, [draft, write])

      const currentLabel = () => {
        if (current === 'custom') return savedCustom || t.custom
        const found = LANGUAGES.find((language) => language.value === current)
        if (!found) return t.follow
        return found.value === 'follow' ? t.follow : found.label
      }

      if (view === 'summary') {
        return h('div', { style: styles.summary }, `${t.summary}: ${currentLabel()}`)
      }

      const status = (() => {
        if (snapshot && snapshot.status === 'loading') return h('p', { style: styles.hint }, t.reading)
        if (snapshot && snapshot.status === 'unavailable') return h('p', { style: styles.error }, t.unavailable)
        if (failed) return h('p', { style: styles.error }, t.failed)
        if (saving) return h('p', { style: styles.hint }, t.saving)
        if (snapshot && snapshot.writable === false) return h('p', { style: styles.hint }, t.readonly)
        return h('p', { style: styles.hint }, t.note)
      })()

      return h(
        'section',
        { style: styles.wrap },
        h('h2', { style: styles.title }, t.title),
        h('p', { style: styles.description }, t.description),
        h(
          'div',
          null,
          h('label', { style: styles.label, htmlFor: 'dsh-thinking-language-select' }, t.field),
          h(
            'select',
            {
              id: 'dsh-thinking-language-select',
              style: styles.select,
              value: current,
              disabled: !writable || busy,
              onChange: (event) => choose(event.target.value),
            },
            LANGUAGES.map((language) =>
              h(
                'option',
                { key: language.value, value: language.value },
                language.value === 'follow' ? t.follow : language.label,
              ),
            ),
            h('option', { value: 'custom' }, t.custom),
          ),
        ),
        current === 'custom'
          ? h(
              'div',
              { style: styles.row },
              h('input', {
                style: styles.input,
                type: 'text',
                value: draft,
                placeholder: t.customPlaceholder,
                disabled: !writable || busy,
                maxLength: 80,
                onChange: (event) => setDraft(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') applyCustom()
                },
              }),
              h(
                'button',
                { style: styles.button, type: 'button', disabled: !writable || busy, onClick: applyCustom },
                t.apply,
              ),
            )
          : null,
        status,
      )
    }

    /** Navigation glyph: a speech bubble wrapping a globe. */
    function Icon({ size = 16 } = {}) {
      const scale = Number(size) > 0 ? Number(size) : 16
      return h(
        'svg',
        {
          width: scale,
          height: scale,
          viewBox: '0 0 64 64',
          fill: 'none',
          'aria-hidden': true,
          style: { display: 'block' },
        },
        h('circle', { cx: 32, cy: 30, r: 16, stroke: 'currentColor', strokeWidth: 5 }),
        h('path', { d: 'M16 30h32', stroke: 'currentColor', strokeWidth: 5, strokeLinecap: 'round' }),
        h('ellipse', { cx: 32, cy: 30, rx: 7, ry: 16, stroke: 'currentColor', strokeWidth: 5 }),
      )
    }

    return {
      inject: ['slots', 'configForms', 'locale'],
      apply(ctx) {
        const form = ctx.configForms.get(ENTRY)

        ctx.effect(
          () => () => {
            void form.dispose()
          },
          'thinking-language: configuration form',
        )

        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            {
              name: 'settings.section',
              id: ENTRY,
              order: 17,
              label: () => (detectLocale(ctx) === 'zh' ? ZH.nav : EN.nav),
            },
            (props) => h(Panel, { ...props, ctx, form, view: 'page' }),
          ),
        )

        ctx.slots.inject('settings.section.icon', () =>
          ctx.slots.register(
            { name: 'settings.section.icon', id: ENTRY },
            (props) => h(Icon, props),
          ),
        )

        ctx.slots.inject('plugins.bundle.config', () =>
          ctx.slots.register(
            { name: 'plugins.bundle.config', key: PACKAGE },
            (props) => h(Panel, { ctx, form, view: props && props.view === 'summary' ? 'summary' : 'page' }),
          ),
        )
      },
    }
  },
})
