# Service Flow Hub

# Contexto do Projeto — ServiceFlow

O **ServiceFlow** é uma plataforma SaaS de gestão voltada para empresas prestadoras de serviços. O primeiro cliente e primeiro caso de uso real será um **lava-rápido**, mas o sistema está sendo pensado desde o início de forma genérica o suficiente para futuramente atender outros segmentos, como oficinas mecânicas, barbearias, pet shops, clínicas, assistências técnicas, estética automotiva, pequenas empresas de manutenção e outros negócios que trabalham com agendamentos e prestação de serviços.

O objetivo principal do ServiceFlow é centralizar em um único sistema informações que atualmente são controladas de forma manual ou descentralizada, especialmente por meio de WhatsApp, papel e planilhas de Excel.

O projeto surgiu a partir de uma necessidade real identificada em 17/07/2026. O proprietário de um lava-rápido relatou que realiza os agendamentos diretamente pelo WhatsApp e gostaria de uma forma mais organizada de registrar os clientes e os serviços agendados. Ele também solicitou uma funcionalidade capaz de gerar mensagens mais profissionais para serem enviadas aos clientes, contendo informações como nome do cliente, data, horário, modelo do veículo, serviço contratado e valor.

Apesar de existir a possibilidade de automatizar o envio dessas mensagens, o proprietário não deseja que o contato com os clientes seja totalmente automatizado. Ele valoriza a interação pessoal e prefere continuar conversando diretamente com cada cliente pelo WhatsApp. Por esse motivo, o ServiceFlow deverá **gerar e preparar a mensagem**, mas o envio continuará sendo realizado manualmente pelo administrador.

A partir dessa demanda inicial, o projeto evoluiu para uma solução mais completa de gestão operacional e financeira.

# Conceito Central

A ideia principal do sistema é que uma única ação realizada pelo usuário alimente diversas áreas da plataforma.

O fluxo principal deve funcionar da seguinte forma:

1. O cliente entra em contato com o estabelecimento pelo WhatsApp.

2. O administrador combina o serviço, data e horário diretamente com o cliente.

3. O administrador abre o ServiceFlow.

4. Cria uma nova Ordem de Serviço.

5. Informa os dados do cliente, veículo, serviço, data, horário e valor.

6. O sistema salva essas informações.

7. A Ordem de Serviço passa automaticamente a aparecer na agenda.

8. O valor do serviço passa a compor o faturamento previsto.

9. O atendimento passa a fazer parte do histórico daquele cliente.

10. O sistema gera automaticamente uma mensagem profissional baseada na Ordem de Serviço.

11. O administrador visualiza a mensagem, pode editá-la e copiá-la.

12. O administrador envia a mensagem manualmente pelo WhatsApp.

13. Após a realização do serviço, a Ordem de Serviço pode ser marcada como finalizada.

14. Apenas serviços finalizados devem compor a receita realizada.

15. Serviços cancelados não devem ser contabilizados como receita efetiva.

Esse conceito é muito importante para o projeto: o usuário deve cadastrar uma informação apenas uma vez, e o sistema deve reutilizar esses dados automaticamente em diferentes módulos.

# Perfil do Usuário

O principal usuário do sistema será o **administrador ou proprietário do negócio**.

O sistema deve ser simples o suficiente para ser utilizado diariamente por uma pessoa que não necessariamente possui conhecimentos avançados de tecnologia.

Por isso, a interface deve priorizar:

- clareza;

- poucos passos;

- baixa curva de aprendizado;

- feedback visual;

- navegação intuitiva;

- ações rápidas;

- informações relevantes visíveis logo na tela inicial.

O aplicativo não deve parecer um ERP complexo.

A proposta é oferecer uma experiência simples, moderna e profissional.

# Identidade Visual

A identidade visual definida para o aplicativo utiliza:

- Cor principal: `#1F0900`

- Cor secundária: `#E02506`

O design deve ser moderno, profissional e compatível com boas práticas de UI/UX para aplicativos mobile.

A interface deve poder ser implementada utilizando Flutter e preferencialmente seguir conceitos próximos ao Material Design/Material 3, sem depender de elementos gráficos impossíveis ou excessivamente complexos para implementação.

# Stack Tecnológica

A stack atualmente definida para o projeto é:

## Aplicativo Mobile

- Flutter

- Dart

O Flutter será responsável pela interface do aplicativo e consumo da API.

## Backend

- Java 21

- Spring Boot

O backend será responsável pelas regras de negócio, persistência de dados, autenticação, cálculos financeiros e exposição da API REST.

## Banco de Dados

- MySQL

O banco armazenará clientes, veículos, serviços, agendamentos, Ordens de Serviço, despesas, usuários e demais informações da plataforma.

## Arquitetura

O projeto utilizará uma API REST.

Estrutura esperada no backend:

- Controller

- Service

- Repository

- Entity/Model

- DTO

- Mapper

- Exception

- Config

- Security

## Outras tecnologias previstas

- Spring Data JPA

- Hibernate

- Spring Validation

- Spring Security

- JWT

- Swagger / OpenAPI

- Maven

- Git

- GitHub

- Railway para deploy

# Estrutura Comercial do Produto

O ServiceFlow será desenvolvido seguindo um modelo SaaS.

O cliente não compra apenas um aplicativo entregue uma única vez. A ideia é que o sistema continue hospedado, recebendo manutenção, suporte e novas funcionalidades.

O modelo comercial pensado possui:

- taxa inicial de implantação;

- mensalidade;

- planos diferentes de acordo com os módulos disponíveis;

- possibilidade de cobrar separadamente por personalizações exclusivas.

A taxa de implantação poderá incluir:

- configuração inicial;

- cadastro do estabelecimento;

- treinamento;

- personalização básica;

- suporte inicial;

- preparação do ambiente.

A mensalidade deverá cobrir:

- hospedagem;

- banco de dados;

- manutenção;

- backup;

- suporte;

- correções;

- atualizações;

- margem de lucro para a empresa responsável pelo software.

# Desenvolvimento em Módulos

O projeto será lançado de forma incremental.

A intenção não é desenvolver todas as funcionalidades antes de colocar o sistema em uso.

A estratégia é lançar primeiro o núcleo que resolve a principal dor do cliente e, posteriormente, desenvolver novos módulos com base no feedback real.

# Módulo 1 — Gestão Operacional / MVP

O primeiro módulo representa a primeira versão comercial do ServiceFlow.

Ele deverá resolver principalmente os problemas relacionados a agendamentos, atendimento e organização dos clientes.

## 1. Login

O aplicativo deverá possuir uma tela de login.

Inicialmente o usuário será o administrador do estabelecimento.

Campos esperados:

- e-mail;

- senha.

No futuro o sistema poderá suportar múltiplos usuários e diferentes permissões.

## 2. Tela Inicial / Dashboard Operacional

A tela inicial deve apresentar informações rápidas e relevantes sobre o dia atual.

Exemplos:

- quantidade de agendamentos do dia;

- faturamento esperado do dia;

- quantidade de serviços concluídos;

- próximo cliente;

- próximos atendimentos;

- atalhos rápidos;

- botão para criar nova Ordem de Serviço.

Essa tela deve funcionar como uma visão geral da operação.

O administrador deve conseguir abrir o aplicativo e entender rapidamente como está o dia.

## 3. Ordem de Serviço

A Ordem de Serviço é uma das entidades centrais da plataforma.

Ela representa um atendimento agendado ou realizado.

Informações previstas:

- número ou identificador da OS;

- cliente;

- telefone;

- veículo;

- marca;

- modelo;

- placa;

- serviço;

- descrição do serviço;

- data;

- horário;

- valor;

- observações;

- status.

Status previstos inicialmente:

- Agendado

- Finalizado

- Cancelado

A etapa "Em andamento" não faz parte do fluxo atual.

A Ordem de Serviço deverá alimentar automaticamente:

- agenda;

- faturamento previsto;

- histórico do cliente;

- indicadores;

- mensagem de WhatsApp.

## 4. Gerador de Mensagens para WhatsApp

Ao criar uma Ordem de Serviço, o sistema deve permitir gerar automaticamente uma mensagem profissional.

A mensagem deve utilizar os dados presentes na OS.

Exemplo de informações:

- nome do cliente;

- data;

- horário;

- veículo;

- serviço;

- valor.

Exemplo de estrutura:

"Olá, João!

Seu atendimento foi confirmado.

Data: 18/07

Horário: 09:30

Veículo: Honda Civic

Serviço: Lavagem Completa

Valor: R$ 80,00

Obrigado pela preferência."

A tela deverá possuir:

- pré-visualização da mensagem;

- opção para editar;

- botão para copiar;

- possibilidade de abrir o WhatsApp futuramente.

Importante:

O sistema não deverá enviar mensagens automaticamente na primeira versão.

O administrador continuará responsável por enviar manualmente a mensagem, preservando o relacionamento pessoal com os clientes.

## 5. Agenda

A agenda deverá mostrar todos os atendimentos cadastrados.

Deve permitir visualizar os serviços por:

- dia;

- horário.

Cada item da agenda poderá exibir:

- horário;

- cliente;

- veículo;

- serviço;

- valor;

- status.

Ações esperadas:

- visualizar detalhes;

- editar;

- cancelar;

- finalizar.

Ao cancelar um serviço, o sistema deverá atualizar automaticamente os indicadores relacionados ao faturamento.

## 6. Clientes

O sistema deverá possuir um módulo para cadastro e gerenciamento de clientes.

Informações previstas:

- nome;

- telefone;

- WhatsApp;

- observações;

- data de cadastro.

O sistema deve permitir:

- pesquisar clientes;

- consultar perfil;

- visualizar histórico;

- consultar veículos;

- visualizar total de serviços realizados;

- visualizar última visita.

## 7. Veículos

Um cliente poderá possuir um ou mais veículos.

Informações previstas:

- marca;

- modelo;

- placa;

- cor;

- cliente proprietário.

A relação esperada é:

Cliente

→ possui

→ um ou vários veículos.

## 8. Histórico do Cliente

Cada cliente deverá possuir um histórico de serviços.

Esse histórico poderá exibir:

- data;

- veículo;

- serviço;

- valor;

- status;

- observações.

Informações derivadas poderão incluir:

- número total de atendimentos;

- última visita;

- total gasto;

- serviços mais utilizados.

Nem todas essas métricas precisam estar presentes no MVP, mas a estrutura do sistema deve permitir sua implementação futura.

# Módulo 2 — Gestão Financeira

O segundo grande módulo do ServiceFlow será o financeiro.

Ele será desenvolvido após a primeira versão entrar em uso e o fluxo operacional ser validado.

O objetivo do módulo é substituir gradualmente o controle financeiro realizado manualmente em Excel.

## Conceito do Financeiro

O sistema deverá diferenciar principalmente:

### Receita prevista

Valor total dos serviços agendados.

### Receita realizada

Valor referente apenas aos serviços que realmente foram concluídos.

Exemplo:

Um serviço de R$ 100 foi agendado.

Inicialmente:

Receita prevista += R$ 100

Se o serviço for finalizado:

Receita realizada += R$ 100

Se for cancelado:

O valor não entra na receita realizada e deve ser removido ou desconsiderado do faturamento previsto conforme a regra definida.

Isso evita que cancelamentos sejam contabilizados como dinheiro recebido.

## 1. Dashboard Financeiro

A tela financeira deverá apresentar indicadores como:

- faturamento do dia;

- faturamento da semana;

- faturamento do mês;

- despesas;

- lucro;

- receita prevista;

- receita realizada;

- ticket médio;

- quantidade de serviços;

- quantidade de cancelamentos.

## 2. Despesas

O administrador deverá poder registrar gastos.

Exemplos:

- produtos;

- shampoo automotivo;

- cera;

- água;

- energia elétrica;

- aluguel;

- funcionários;

- manutenção;

- impostos;

- fornecedores;

- outras despesas.

Campos previstos:

- descrição;

- categoria;

- valor;

- data;

- observação.

## 3. Lucro

O sistema poderá utilizar inicialmente uma regra simples:

Lucro = Receita Realizada - Despesas

No futuro poderão existir métricas mais avançadas.

## 4. Filtros

O financeiro deverá permitir filtros por período, como:

- hoje;

- semana;

- mês;

- período personalizado.

## 5. Relatórios

Futuramente deverão existir relatórios contendo:

- receitas;

- despesas;

- lucro;

- serviços mais vendidos;

- ticket médio;

- volume de atendimentos;

- cancelamentos;

- comparação entre períodos.

# Futuras Funcionalidades

O projeto deverá ser construído de forma que permita evolução gradual.

Funcionalidades previstas para versões futuras incluem:

## Programa de Fidelidade

Permitir acompanhar a frequência dos clientes.

Exemplo:

A cada 5 lavagens, o cliente recebe uma lavagem gratuita ou algum benefício.

## Clientes Inativos

O sistema poderá identificar clientes que não retornam há determinado período.

Exemplo:

"Cliente não realiza um serviço há 45 dias."

O sistema poderá oferecer um botão para gerar uma mensagem de retorno.

O envio continuará podendo ser manual.

## Controle de Estoque

Controle dos produtos utilizados pela empresa.

Exemplos:

- shampoo;

- cera;

- produtos de limpeza;

- panos;

- materiais.

Possíveis funcionalidades:

- quantidade atual;

- entrada;

- saída;

- estoque mínimo;

- alerta de reposição.

## Funcionários

Cadastro de colaboradores.

Possíveis informações:

- nome;

- função;

- serviços realizados;

- produtividade.

## Painel Web

Além do aplicativo mobile, futuramente poderá existir uma aplicação web voltada para administração.

Esse painel poderá consumir a mesma API REST utilizada pelo aplicativo Flutter.

## Aplicativos Nativos

A arquitetura deverá permitir que futuramente sejam desenvolvidos outros clientes para a mesma API.

Exemplos:

- Android nativo com Kotlin;

- iOS com Swift/SwiftUI;

- painel web.

A lógica de negócio deverá permanecer no backend sempre que possível.

## Inteligência Artificial

A IA não faz parte do MVP.

Possíveis aplicações futuras:

- geração mais personalizada de mensagens;

- previsão de faturamento;

- identificação de clientes com maior probabilidade de retorno;

- insights comerciais;

- análise de desempenho;

- sugestões de campanhas;

- identificação de padrões de consumo.

# Multiempresa / SaaS

O ServiceFlow deve ser pensado para futuramente atender várias empresas utilizando uma única plataforma.

Exemplo:

- Lava-Rápido A

- Oficina B

- Barbearia C

Cada empresa deve visualizar apenas seus próprios:

- clientes;

- serviços;

- usuários;

- Ordens de Serviço;

- receitas;

- despesas.

Uma entidade "Empresa" poderá ser utilizada como base dessa separação.

Exemplo conceitual:

Empresa

→ Clientes

→ Veículos

→ Serviços

→ Ordens de Serviço

→ Despesas

Essa arquitetura permitirá que novos clientes entrem na plataforma sem a necessidade de criar uma nova aplicação para cada empresa.

# Princípios de Desenvolvimento

Ao auxiliar no desenvolvimento deste projeto, considere os seguintes princípios:

1. Priorizar simplicidade.

2. Evitar overengineering.

3. Não utilizar microsserviços no MVP.

4. Utilizar um monólito modular bem organizado.

5. Manter regras de negócio no backend.

6. Utilizar DTOs entre API e aplicação.

7. Criar tratamento global de erros.

8. Utilizar validações.

9. Documentar endpoints com Swagger/OpenAPI.

10. Utilizar versionamento de API, preferencialmente `/api/v1`.

11. Utilizar boas práticas de segurança.

12. Nunca armazenar senhas em texto puro.

13. Preparar a arquitetura para múltiplas empresas.

14. Utilizar Git e GitHub desde o início.

15. Separar ambientes de desenvolvimento e produção.

16. Criar uma experiência simples no aplicativo.

17. Priorizar código legível e fácil de manter.

18. Não adicionar tecnologias complexas sem necessidade real.

# Estrutura de Repositórios

O ecossistema poderá ser dividido da seguinte forma:

`serviceflow-hub`

Repositório central contendo:

- visão geral;

- documentação;

- roadmap;

- requisitos;

- arquitetura;

- links para os demais projetos.

`serviceflow-api`

Backend da plataforma.

Stack:

- Java 21;

- Spring Boot;

- MySQL;

- API REST.

`serviceflow-app`

Aplicativo mobile.

Stack:

- Flutter;

- Dart.

`serviceflow-web`

Aplicação administrativa web futura.

# Roadmap de Produto

## Versão 1 — MVP

Objetivo:

Resolver a gestão operacional.

Inclui:

- login;

- dashboard;

- agenda;

- clientes;

- veículos;

- Ordem de Serviço;

- gerador de mensagens;

- histórico básico.

## Versão 2 — Financeiro

Inclui:

- despesas;

- receita prevista;

- receita realizada;

- lucro;

- dashboard financeiro;

- relatórios básicos.

## Versão 3 — Expansão

Possíveis recursos:

- fidelidade;

- clientes inativos;

- estoque;

- funcionários;

- relatórios avançados;

- painel web.

## Futuro

- IA;

- integrações;

- pagamentos;

- múltiplas unidades;

- aplicativos nativos;

- automações.

# Prazo Inicial

A estimativa inicial para desenvolvimento do Módulo 1 é de aproximadamente **45 a 60 dias corridos**, considerando desenvolvimento por uma única pessoa e incluindo:

- levantamento de requisitos;

- planejamento;

- UI/UX;

- modelagem do banco;

- desenvolvimento da API;

- desenvolvimento Flutter;

- integração;

- testes;

- correções;

- deploy;

- implantação.

O Módulo 2 deverá ser desenvolvido após o MVP entrar em uso e receber feedback.

A estimativa inicial para o módulo financeiro é de aproximadamente **15 a 25 dias adicionais**, dependendo da quantidade de indicadores e relatórios implementados.

Esses prazos são estimativas e podem variar de acordo com mudanças de escopo.

# Objetivo Estratégico

O ServiceFlow não deve ser tratado apenas como um aplicativo criado para um único lava-rápido.

O objetivo estratégico é transformar o projeto em um produto comercial reutilizável.

O primeiro lava-rápido funcionará como cliente piloto e ambiente real de validação.

O processo esperado é:

Desenvolver MVP

→ implantar

→ observar utilização real

→ coletar feedback

→ corrigir problemas

→ melhorar o produto

→ lançar módulo financeiro

→ conseguir novos clientes

→ adaptar a solução para outros segmentos.

O maior valor do projeto está em construir uma plataforma que possa ser comercializada várias vezes, utilizando a mesma base tecnológica.

# Orientação para IAs que auxiliarem no projeto

Ao responder perguntas ou gerar código para o ServiceFlow, considere sempre todo este contexto.

Não trate o projeto como um simples aplicativo de agenda.

Ele é uma plataforma SaaS de gestão de serviços.

Priorize soluções que:

- sejam viáveis para uma pequena software house;

- possam ser mantidas por poucos desenvolvedores;

- permitam evolução gradual;

- sejam simples para o usuário final;

- reutilizem a mesma API entre diferentes aplicações;

- sejam seguras;

- sejam escaláveis sem complexidade prematura;

- mantenham o foco nas necessidades reais do cliente.

Quando houver várias possibilidades técnicas, priorize a solução mais simples que resolva corretamente o problema e permita evolução futura.


 crie telas para o app que contenha todas as funcionalidades, as telas devem respeitar as práticas de ux/ui e ser pensada para ser desenvolvida em kotlin e/ou flutter

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7f278733-6b75-405f-b7d7-8d2bf4399b2f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
# ServiceFlow Frontend

Frontend React/TanStack integrado à API Spring Boot do ServiceFlow.

## Execução local

Com o MySQL e a API ativos em `localhost:9000`:

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

A variável `VITE_API_URL` aponta por padrão para `http://localhost:9000/api/v2`. O servidor de desenvolvimento deste projeto abre normalmente em `http://localhost:8080`.

## Integração

- Login JWT com refresh automático.
- Recuperação de senha.
- Empresa e catálogo de serviços.
- Clientes e veículos.
- Ordens de serviço e mudança de status.
- Despesas, agenda, dashboard e financeiro.
- IDs numéricos da API normalizados para o roteamento do frontend.

## Telas

### Login
<img width="456" height="873" alt="Login" src="https://github.com/user-attachments/assets/948d6e7c-d9dd-4b85-9a57-b50bfac3ef33" />

### Inicio
<img width="412" height="892" alt="Inicio" src="https://github.com/user-attachments/assets/81a740b1-3ba2-42d5-a0ee-6399efc4ba4d" />

### Agenda de Clientes
<img width="399" height="777" alt="Agenda de Clientes" src="https://github.com/user-attachments/assets/e1289c4c-415b-4ded-9149-aa01fac9c960" />

### Perfil de Clientes
<img width="442" height="810" alt="Cliente Perfil" src="https://github.com/user-attachments/assets/a1dd323c-98d6-4aac-94b6-14d4d19f44d7" />

### Home Financeiro
<img width="433" height="834" alt="Financeiro Home" src="https://github.com/user-attachments/assets/800f8c96-ce5f-48a8-9323-90edfb1b3bcd" />

### Cadastro de despesas
<img width="525" height="823" alt="Financeiro Cadastro" src="https://github.com/user-attachments/assets/253b520e-764b-478c-95a1-33d4a3b12d9b" />

### Lista de despesas
<img width="455" height="803" alt="Cad despesas" src="https://github.com/user-attachments/assets/aba35062-bb24-49b5-a74f-2c7d6f9eb85f" />

<img width="399" height="777" alt="Captura de tela 2026-08-09 003945" src="https://github.com/user-attachments/assets/5a5736a5-21fa-449e-aced-077a4d4dc033" />





