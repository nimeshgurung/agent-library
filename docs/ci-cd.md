# CI/CD (GitHub Actions & GitLab CI)

Your pipeline should: (1) install deps, (2) run lint/typecheck, (3) build catalog + frontend, (4) publish Pages.

## GitHub Actions

```yaml
name: build-and-deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm --prefix frontend ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/dist

  deploy:
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## GitLab CI

```yaml
image: node:20

cache:
  paths:
    - node_modules/
    - frontend/node_modules/

stages:
  - build
  - deploy

build:
  stage: build
  script:
    - npm ci
    - cd frontend && npm ci && cd ..
    - npm run lint
    - npm run typecheck
    - npm run build
    - mv frontend/dist public
  artifacts:
    paths:
      - public

pages:
  stage: deploy
  script:
    - echo 'Deploying GitLab Pages'
  artifacts:
    paths:
      - public
  only:
    - main
```

## Notes

- Ensure `copilot-catalog.json` is generated before publishing the frontend.
- Use immutable builds; avoid mutating `artifacts/index.json` during deploy.
- For private catalogs, wire secrets for tokens in the pipeline (see docs/private-catalogs.md).
