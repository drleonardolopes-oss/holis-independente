# Holis — instalação independente (prévia técnica)

Estado em 05/11/2026: pacote preparado para avaliação, não liberado para distribuição a pacientes ou colegas sem assistência.

Cada cópia usa a conta Cloudflare do próprio titular. Nenhum endereço, e-mail autorizado, banco, logotipo ou credencial da instalação original está configurado aqui. Inclui a revisão de 56 textos do questionário.

## O que já funciona nesta base

- Configuração individual do titular pelo campo HOLIS_OWNER_EMAIL; login somente com JWT validado do Cloudflare Access e e-mail igual ao titular.
- Banco D1 e armazenamento R2 configurados como recursos novos, com nomes genéricos.
- Recebimento bloqueado por padrão; configuração ausente impede abrir as rotas de avaliação.
- Tela /instalacao com itens concluídos e pendentes, sem exibir e-mail ou identificadores de acesso.
- Migrações para um banco novo. Nunca instalar sobre um banco com dados de outra instalação.
- Cadastro da clínica após autenticação; sem dados comerciais ou pessoais da clínica original.

## Caminho de instalação que está sendo preparado

1. Repositório público autorizado pelo proprietário: https://github.com/drleonardolopes-oss/holis-independente.
2. O botão oficial Deploy to Cloudflare copiará o repositório para a conta do colega e criará os recursos declarados.
3. A primeira instalação fica bloqueada e abre a página de orientação.
4. O colega configura o Cloudflare Access para /entrar, com política Allow restrita ao próprio e-mail, e informa HOLIS_OWNER_EMAIL, ACCESS_ISSUER e ACCESS_AUDIENCE no Worker.
5. O titular entra, preenche os dados da própria clínica e testa com informações fictícias.
6. Após verificar login, restrição de acesso, questionário, PDF, exportação e recuperação, pode liberar CLINICAL_INTAKE_ENABLED=true na configuração e repetir a verificação após publicar.

A etapa 4 ainda é manual no painel e impede considerar este pacote um instalador autônomo para pessoas sem experiência. Não há coleta de token Cloudflare no navegador nem autorização automática implementada. O botão de instalação ainda não foi liberado: falta validar o provisionamento e simplificar a integração do acesso.

## Publicação técnica do modelo

Requer autorização para disponibilizar o código-fonte publicamente. A documentação da Cloudflare exige repositório público GitHub/GitLab para o botão. Não gerar um link fictício antes de existir o repositório.

Comandos de build e deploy estão no package.json. O deploy aplica migrações somente ao binding DB da nova instalação e publica dist/server/wrangler.json. Confirmar em conta de testes que o provisionamento substitui o ID ilustrativo do banco antes de executar migrações.

Variáveis:

| Campo | Valor |
|---|---|
| HOLIS_OWNER_EMAIL | E-mail do próprio titular |
| ACCESS_ISSUER | URL HTTPS da equipe Cloudflare Access do próprio titular |
| ACCESS_AUDIENCE | AUD do aplicativo Access desta instalação |
| CLINICAL_INTAKE_ENABLED | false durante preparação; true somente após validação |

A política do Access e a autorização interna são necessárias. Esta prévia aceita somente o titular; não oferece cadastro autônomo de equipe. Não usar valores da instalação original.

## Validação realizada

- Verificação adicional de JWT: assinatura, expiração, emissor, audiência e adulteração.
- 3 testes Node do estado de instalação: pré-requisitos, rejeição de configuração inválida, página sem divulgação de valores configurados.
- Migrações executadas em SQLite temporário: 7 tabelas, todas vazias.
- Varredura textual sem identificadores da clínica de origem no pacote final.
- Atualizador das perguntas aplicado uma vez nesta cópia.

Não executados nesta prévia: build completo com dependências, teste em Workers, provisionamento pelo botão, login Access em conta nova, fluxo de paciente, PDF, exportação e restauração em conta nova. A publicação da instalação original não valida estas alterações.

## Critérios para disponibilizar à turma

- Configuração do acesso sem assistência, testada por pessoa que nunca usou Cloudflare.
- Negação de acesso ao e-mail de terceiro e ao titular da instalação original.
- Dois bancos de teste sem acesso cruzado.
- Salvamento, PDF e cópia de segurança funcionando após a instalação.
- Recuperação de acesso documentada e testada.
- Custos e requisitos de conta apresentados antes da contratação.
- Atualizações e recuperação testadas sem perda de dados.

O botão provisiona infraestrutura; não substitui esses testes. Nenhum pagamento ou publicação foi realizado ao preparar este pacote.

Fontes oficiais consultadas em 04/11/2026:
- https://developers.cloudflare.com/workers/platform/deploy-buttons/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/
