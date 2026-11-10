# ADRs da Etapa 2 – desvios em relação à arquitetura da Etapa 1

Numeração continua a da Etapa 1 (ADR 01 a 04). Todas com status **Aceito**.

## ADR 05 – Execução totalmente no navegador (sem servidor)
- **O que mudou:** a Etapa 1 previa API REST com autorização no servidor (ADR 02) e dois servidores de aplicação (ADR 03). Nesta sprint a aplicação roda inteira no navegador; os *controllers* são funções JavaScript.
- **Justificativa:** o trabalho avalia a arquitetura e as regras de negócio; um servidor exigiria mais infraestrutura e tempo do que a Sprint comporta. Manter as camadas (tela → controller → módulo → repositório) preserva o desenho.
- **Consequências:** (+) simples de rodar e de demonstrar. (−) a segurança é só simulada (ver ADR 07); sem servidor não há redundância (ADR 03 não se aplica). **Migração:** trocar a chamada direta aos controllers por `fetch` para uma API, sem mudar módulos.

## ADR 06 – Persistência em localStorage atrás de repositórios
- **O que mudou:** em vez de banco relacional (PostgreSQL) com índices e paginação, os dados ficam no `localStorage`.
- **Justificativa:** sem servidor não há banco; escondemos o armazenamento atrás de `colecao.js` e dos repositórios, então trocar por um banco real altera só a pasta `infraestrutura/persistencia`.
- **Consequências:** (+) sem instalação. (−) dados presos ao navegador; sem transações nem integridade referencial (as regras ficam no código); sem índices (volume pequeno).

## ADR 07 – Autenticação simulada
- **O que mudou:** a ADR 03 pedia hash de senha (Argon2id), JWT assinado, bloqueio após 5 falhas e recuperação por token. Aqui o token é apenas codificado em base64 (qualquer um poderia forjá-lo) e as senhas de teste ficam em texto; REQ 03 não foi implementado.
- **Justificativa:** sem servidor não existe segredo para assinar tokens. Mantivemos o fluxo (login → token com validade de 30 min → permissão por perfil verificada a cada ação no controller) e a mensagem genérica de erro.
- **Consequências:** (+) o RBAC aparece funcionando e testado. (−) **não é seguro para produção**; documentado no README.

## ADR 08 – Interface em páginas HTML separadas, sem framework (não é SPA)
- **O que mudou:** a Etapa 1 descrevia uma SPA; aqui cada tela é uma página HTML com um módulo JavaScript.
- **Justificativa:** menor curva de aprendizado e nenhuma dependência para instalar; o visual segue exatamente os protótipos do Figma.
- **Consequências:** (+) simples. (−) o **cache da agenda** (ADR 04) vive em memória e é recriado a cada página aberta; navegação recarrega a página.

## ADR 09 – Agendamento duplo evitado só por validação no código
- **O que mudou:** a decisão da Etapa 1 previa também uma restrição de intervalo no banco.
- **Justificativa:** `localStorage` não tem restrições. A regra (`ConflictValidator`, função `agendar`) consulta o **repositório**, nunca o cache, antes de gravar.
- **Consequências:** (+) regra testada (`tests/regras.test.mjs`). (−) duas abas abertas ao mesmo tempo poderiam, em teoria, agendar o mesmo horário; um banco real resolveria com a restrição.

## ADR 10 – Eventos de domínio, Notificações e Auditoria adiados
- **O que mudou:** a Etapa 1 previa um barramento de eventos (ConsultaAgendada etc.) consumido por Notificações e Auditoria.
- **Justificativa:** esses módulos atendem REQ 16 e à trilha de auditoria, fora dos 30% desta Sprint. Os módulos de Cadastro e Agendamento já têm interface pública, então publicar eventos depois não exige reescrevê-los.
- **Consequências:** (−) nenhum e-mail é enviado e não há trilha de auditoria nesta Sprint. (+) menor escopo, foco nas regras centrais.
