
Custom-CCP

Root

Folders: 
    node_modules

    src 
        Folders:
        - api
        - assets
        - components 
        - unit

        Files:
        - config-dev.json
        - config-prod.json
        - favicon.ico
        - index.tsx
        - types.d.ts

Files:
    - .babelrc.json
        Babel is used to transpile the JavaScript code, making it compatible with older browsers.

    - .gitignore

    - generate-config.sh
        Generates config file for dev, stage, prod

    - package-lock.json
    - package-json
    - README.md

    - tsconfig.json
        Specifies the root files and the compiler options required to compile the project.

    - webpack.config.js
        Webpack is used to bundle and optimize the code.

