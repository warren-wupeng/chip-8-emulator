# chip-8-emulator
A CHIP-8 emulator using React

Website deployed at: https://76f0zmbn4q3f.trickle.host/

# How to Run Locally

Steps:

1. Install local development server:
```bash
npm install -g http-server
```

1. Run server in project root directory:
```bash
cd /Users/wupeng/projects/chip-8-emulator
http-server src
```

1. Access in browser:
```
http://localhost:8080
```

Important Notes:

1. Ensure all referenced JavaScript files are correctly created
2. styles.css file must include necessary styles
3. Project depends on React, ReactDOM, Babel and TailwindCSS (included via CDN)
4. Default ROM games need to be defined in defaultRoms.js
5. Since Babel is used for real-time transformation, it's recommended to use pre-compilation in production

If you encounter CORS issues, start the server with this command:
```bash
http-server src --cors
```