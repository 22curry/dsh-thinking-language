# Vendored dependencies

DSH installs a local bundle by **linking** its directory; pnpm does not install the
dependencies of a linked package. A plugin therefore has to be droppable as a plain
folder, so the two runtime packages it needs are checked in here, unmodified, at the
versions the running harness uses.

| Path | Package | Version | License |
| --- | --- | --- | --- |
| `vendor/schemastery/` | [`@deepseek-ai/schemastery`](https://www.npmjs.com/package/@deepseek-ai/schemastery) | 3.19.0 | MIT (`LICENSE-schemastery.txt`) |
| `vendor/node_modules/@deepseek-ai/cosmokit/` | [`@deepseek-ai/cosmokit`](https://www.npmjs.com/package/@deepseek-ai/cosmokit) | 1.9.0 | MIT (`LICENSE-cosmokit.txt`) |

`schemastery` declares its `Config` schema; `cosmokit` is its only runtime dependency.
The second package sits under `vendor/node_modules/` so that Node resolves the bare
`@deepseek-ai/cosmokit` import inside the vendored ESM build without patching it.

Only `lib/` and `package.json` are kept; tests, source maps, and type declarations are
omitted. Values parsed by this copy are interchangeable with the harness's own copy:
both sides of the volatile-config protocol are keyed by a `Symbol.for(...)` registry
(`cosmokit.volatile.write`), which is shared across module copies by design.

To update, replace the files with the matching tarball from npm and bump the table.
