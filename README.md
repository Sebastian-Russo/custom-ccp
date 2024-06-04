
Custom-CCP

Root

Folders: 
    node_modules

    src 
        Folders:
        - api
            custom built apis for amazon-connect-streams apis
        - assets
            holds favicon and amazon ember font
        - components 
            layout
            app
            connect contact attribute table
            header bar
            metric table
            quick info
            time
        - unil
            ccp
            cognito auth
            hooks
            input
            layout
            ui
        - aws connect

        Files:
        - config.json
            specific account info to initialize connect CCP - connect.core.initCCP()
            developement and production versions
            - config-dev.json
            - config-prod.json
        - favicon.ico
        - index.tsx
            attach react app to root file in html
        - types.d.ts
            module using CommonJS patterns uses module.exports to describe the exported values

Files:
    - .babelrc.json
        Babel is used to transpile the JavaScript code, making it compatible with older browsers.

    - .gitignore
        ignore package.json, dist, node_modules

    - generate-config.sh
        Generates config file for dev, stage, prod

    - package-lock.json
    - package-json
    - README.md

    - tsconfig.json
        Specifies the root files and the compiler options required to compile the project.

    - webpack.config.js
        Webpack is used to bundle and optimize the code.

