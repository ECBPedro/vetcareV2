# VetCare

Sistema de gestão para clínica veterinária (Trabalho II – Engenharia de Software 1, UFBA).
Feito só com **HTML, CSS e JavaScript** (sem servidor e sem banco de dados). Estilo arquitetural: **monolito modular**.

## Requisitos implementados nessa etapa

| REQ | Requisito | Onde está |
|---|---|---|
| 02 | Autenticar Usuário | `index.html`, `js/api/controllers/auth.controller.js` |
| 04 | Manter Tutor | `paginas/tutores-animais.html` (perfil Recepcionista) |
| 05 | Manter Animal | `paginas/tutores-animais.html` |
| 07 | Agendar Consulta | `paginas/agendar-consulta.html` (perfil Recepcionista) |
| 09 | Consultar Agenda | `paginas/agenda.html` (dia, semana, profissional) |

As demais telas existem, mas mostram "prevista para uma próxima sprint".
As decisões que diferem da Etapa 1 estão em [`docs/ADRs-etapa-2.md`](docs/ADRs-etapa-2.md).

## Como rodar
Precisa só de um navegador e do Python (ou qualquer servidor de arquivos estáticos).

```bash
git clone https://github.com/ECBPedro/vetcareV2.git
cd vetcare
python3 -m http.server 8000
```
Abra http://localhost:8000 no navegador. (Não abra o `index.html` com duplo clique: os módulos JavaScript exigem um servidor.)

## Contas de teste
| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | carlos.silva@clinica.com | admin123 |
| Recepcionista | ana.souza@clinica.com | recep123 |
| Veterinário | paulo.reis@clinica.com | vet12345 |

Roteiro rápido: entre como **Recepcionista** → *Tutores e animais* (cadastre um tutor e um animal) → *Agendar consulta* (escolha animal, veterinário, data e horário) → *Agenda* (veja a consulta). Entre como **Veterinário** para ver só a própria agenda.
Para voltar aos dados iniciais, limpe o armazenamento do site no navegador (DevTools → Application → Local Storage → Clear).

## Testes automáticos
Precisa do Node.js 20 ou superior. Na pasta do projeto: `node --test`

## Estrutura (segue a arquitetura da Etapa 1)
```
js/
  app/                  telas: cada página tem seu arquivo (só chamam os controllers)
  api/controllers/      "porta de entrada": autoriza o perfil e chama o módulo
  api/seguranca/        token, perfis (RBAC) e permissões por ação
  modulos/<modulo>/     regras de negócio; index.js é a interface pública do módulo
  infraestrutura/       persistência (localStorage), cache em memória
  compartilhado/        datas e validações
```
Regra de dependência: tela → controller → módulo → repositório. Um módulo só importa o `index.js` de outro.

## Limitações conhecidas
Login e permissões são uma **simulação no navegador** (ADR-05 e ADR-07). Em um sistema real, isso é verificado no servidor.
