import{Chalk as t}from"chalk";import{dirname as s,join as a}from"node:path";import{fileURLToPath as d}from"node:url";import{HEROUI_AUTH_TOKEN as r,PRODUCTS as c,HEROUI_WEB_URL as l,HELP_EMAIL as m}from"heroui-pro/consts";import{downloadFromCI as p,downloadFromCLI as u}from"heroui-pro/cdn";import{getCredentials as g}from"heroui-pro/auth/keyring";import{getCIToken as f}from"heroui-pro/auth/ci";const h=s(d(import.meta.url)),e=a(h,"../../");e.includes("node_modules")||process.exit(0);const o=c.react,n=new t({level:3}),b=()=>{console.log(n.yellow.bold(`
Sign in to finish installing ${o.name}.
`)),console.log(n.yellow(`Run:

  ${n.bold("npx heroui-pro login")}

Then re-run install, or:

  ${n.bold("npx heroui-pro install")}

For CI/CD, set the ${n.bold.underline(r)} environment variable.
Need a license? Visit ${n.bold.underline(l)}.
`))},C=async()=>{if(f())return await p(o,e);if(await g())return await u(o,e);b(),process.exit(0)};C().catch(i=>{console.log(n.red.bold(`Access denied: You don't have permission to install ${o.name}.
`)),console.log(n.red(`To get a license, visit ${n.bold.underline(l)}.
If you already have one, run:

${n.bold("npx heroui-pro login")}

For CI/CD environments, ensure the ${n.bold.underline(r)} environment variable is set.

Need help? Contact ${n.bold.underline(m)} for assistance.
`)),console.log(n.gray(i.message)),process.exit(1)});
