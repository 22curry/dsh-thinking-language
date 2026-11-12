# dsh-thinking-language

[English](README.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Español](README.es.md) | **Português**

Escolha nas configurações do DSH o idioma em que os modelos do **DeepSeek Harness** pensam — chinês, inglês, alemão, francês, espanhol, português, japonês, coreano e outros.

A escolha pertence ao perfil, não a uma conversa: novas sessões, outros espaços de trabalho, subagentes e reinícios mantêm a configuração. Basta definir uma vez.

---

## Por que existe

A cadeia de raciocínio de um modelo é gerada pelo próprio modelo, no idioma que ele decide usar. O único lugar onde essa decisão pode ser influenciada é a requisição que a inicia. Este plugin adiciona uma seção curta ao prompt do sistema nomeando o idioma do raciocínio. Assim o pensamento é **escrito nesse idioma desde o primeiro token**:

- sem chamada extra ao modelo, sem serviço de tradução, sem latência;
- nada sai da sua máquina;
- a resposta visível continua seguindo o idioma do usuário.

## Instalação

**Pela interface do DSH**

1. Coloque esta pasta em qualquer lugar.
2. Na barra lateral: **Plugins** → **Add plugin** → **Install a third-party plugin**.
3. Cole o caminho absoluto desta pasta (por exemplo `C:\Users\you\dsh-thinking-language`) e instale.
4. O pacote aparece em **Installed plugins** e fica ativo após a instalação.

**Pelo npm** (depois de publicado)

```bash
dsh plugin add dsh-thinking-language
```

## Uso

Abra **Configurações** → **思考语言**, escolha um idioma, pronto.

O mesmo controle também aparece na página do pacote em **Plugins**; os dois leem e gravam o mesmo valor.

| Opção | Efeito |
| --- | --- |
| Seguir a conversa (padrão) | Nada é adicionado ao prompt; o modelo se comporta como antes. |
| `中文`, `English`, `日本語`, `한국어`, `Deutsch`, `Français`, `Español`, `Português`, `Italiano`, `Русский`, `العربية`, `हिन्दी`, `ไทย`, `Tiếng Việt`, `Türkçe`, `Bahasa Indonesia` | O modelo raciocina nesse idioma. |
| Outro idioma… | Texto livre para o que não estiver na lista (por exemplo `Norwegian`, `Cantonese`). |

As mudanças valem na próxima requisição ao modelo; não precisa reiniciar.

## Como funciona

- A parte Host registra uma seção do prompt do sistema (`thinking-language`, ordem `10300`, a última do prompt montado) com uma instrução de duas linhas. Com *Seguir a conversa* o texto fica vazio e a seção desaparece, então o padrão não custa nada.
- A escolha é a configuração do próprio plugin (`thinking-language` no patch do perfil). O campo é volatile: uma gravação vale na hora e a próxima requisição lê o valor novo.
- A parte do navegador desenha os dois pontos de entrada com o serviço compartilhado de formulários de configuração; os dois gravam pelo documento de configurações do Host. Por isso o valor sobrevive a reinícios e é compartilhado por todas as sessões.

## Privacidade e custo

Sem acesso à rede, sem telemetria, sem credenciais. A instrução custa cerca de 50 tokens por requisição **apenas enquanto um idioma está selecionado**; no padrão ela não é enviada.

## Limitações

- Só age em modelos que expõem o raciocínio.
- A instrução é seguida pelo modelo, não imposta pelo harness — em tarefas muito curtas ele pode voltar ao idioma da conversa.
- Trocar de idioma muda o prefixo do prompt do sistema, então o cache do provedor é reconstruído uma vez a partir dali.
- O raciocínio já registrado em sessões antigas não é reescrito nem traduzido.

## Desenvolvimento

```bash
node --check index.js
node --check client.js
```

Instale a pasta como acima; com HMR a parte Host recarrega no lugar e a do navegador junto com o módulo de cliente que ela registra.

## Licença

MIT — veja [LICENSE](./LICENSE).
