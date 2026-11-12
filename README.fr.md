# dsh-thinking-language

[English](README.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Deutsch](README.de.md) | **Français** | [Español](README.es.md) | [Português](README.pt.md)

Choisissez dans les réglages de DSH la langue dans laquelle les modèles **DeepSeek Harness** réfléchissent — chinois, anglais, allemand, français, espagnol, portugais, japonais, coréen et d'autres.

Le choix appartient au profil, pas à une conversation : nouvelles sessions, autres espaces de travail, sous-agents et redémarrages le conservent. On le règle une fois.

---

## Pourquoi ce plugin existe

La chaîne de raisonnement d'un modèle est produite par le modèle, dans la langue qu'il décide d'utiliser. Le seul endroit où l'on peut influencer cette décision est la requête qui la déclenche. Ce plugin ajoute une courte section au prompt système qui nomme la langue de raisonnement. Le raisonnement est donc **écrit dans cette langue dès le premier token** :

- aucun appel de modèle supplémentaire, aucun service de traduction, aucune latence ;
- rien ne quitte votre machine ;
- la réponse visible suit toujours la langue de l'utilisateur.

## Installation

**Depuis l'interface DSH**

1. Placez ce dossier où vous voulez.
2. Dans la barre latérale : **Plugins** → **Add plugin** → **Install a third-party plugin**.
3. Collez le chemin absolu de ce dossier (par exemple `C:\Users\you\dsh-thinking-language`) et installez.
4. Le bundle apparaît dans **Installed plugins** et est actif après l'installation.

**Depuis npm** (après publication)

```bash
dsh plugin add dsh-thinking-language
```

## Utilisation

Ouvrez **Réglages** → **思考语言**, choisissez une langue, c'est fini.

Le même contrôle apparaît aussi sur la page du bundle dans **Plugins** ; les deux lisent et écrivent la même valeur.

| Choix | Effet |
| --- | --- |
| Suivre la conversation (par défaut) | Rien n'est ajouté au prompt ; le modèle se comporte exactement comme avant. |
| `中文`, `English`, `日本語`, `한국어`, `Deutsch`, `Français`, `Español`, `Português`, `Italiano`, `Русский`, `العربية`, `हिन्दी`, `ไทย`, `Tiếng Việt`, `Türkçe`, `Bahasa Indonesia` | Le modèle raisonne dans cette langue. |
| Autre langue… | Texte libre pour ce qui n'est pas listé (par exemple `Norwegian`, `Cantonese`). |

Les changements prennent effet à la requête suivante ; aucun redémarrage.

## Fonctionnement

- La partie Host enregistre une section du prompt système (`thinking-language`, ordre `10300`, la dernière du prompt assemblé) contenant une instruction de deux lignes. Avec *Suivre la conversation*, le texte est vide et la section disparaît : le choix par défaut ne coûte rien.
- Le choix est la configuration du plugin lui-même (`thinking-language` dans le patch du profil). Le champ est volatile : une écriture s'applique sur place et la requête suivante lit la nouvelle valeur.
- La partie navigateur affiche les deux points d'entrée avec le service de formulaire de configuration partagé ; les deux écrivent via le document de réglages du Host. C'est pourquoi la valeur survit aux redémarrages et vaut pour toutes les sessions.

## Confidentialité et coût

Aucun accès réseau, aucune télémétrie, aucun identifiant. L'instruction coûte environ 50 tokens par requête, **uniquement lorsqu'une langue est sélectionnée** ; avec la valeur par défaut, elle n'est pas envoyée du tout.

## Limites

- Cela n'agit que sur les modèles qui exposent leur raisonnement.
- L'instruction est suivie par le modèle, pas imposée par le harnais — sur une tâche très courte, il peut revenir à la langue de la conversation.
- Changer de langue change le préfixe du prompt système, donc le cache du fournisseur est reconstruit une fois à partir de ce point.
- Le raisonnement déjà enregistré dans les anciennes sessions n'est ni réécrit ni traduit.

## Développement

```bash
node --check index.js
node --check client.js
```

Installez le dossier comme ci-dessus ; avec un profil sous HMR, la partie Host se recharge sur place et la partie navigateur avec le module client qu'elle enregistre.

## Licence

MIT — voir [LICENSE](./LICENSE).
