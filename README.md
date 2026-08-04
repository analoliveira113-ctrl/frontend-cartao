# 💳 Meu Cartão SENAI - Sistema de Localização e Gestão RFID

> Solução IoT e Web desenvolvida para mitigar o problema de perda e localização de cartões estudantis RFID no contexto do SENAI/SESI.

---

## 📌 Título e Descrição

O **Meu Cartão SENAI/SESI** é um sistema web e API criado para solucionar e otimizar a gestão de cartões de identificação de estudantes nas unidades do SENAI/SESI. 

Através da plataforma, o aluno pode:
* **Cadastrar** seu cartão de estudante e vincular à sua matrícula.
* **Consultar** a situação do cartão em tempo real.
* **Rastrear** a localização do cartão via sinal de radiofrequência (RSSI) com visualização em mapa interativo georreferenciado.

---

## 🛠️ Tecnologias Utilizadas

### **Front-end**
* **HTML5 / CSS3 / JavaScript (ES6+)**
* **Leaflet.js & OpenStreetMap:** Renderização do mapa e marcadores interativos de geolocalização.
* **Hospedagem:** GitHub Pages.

### **Back-end & Banco de Dados**
* **Node.js & Express.js:** API RESTful com rotas de CRUD.
* **Supabase (PostgreSQL):** Persistência de dados dos cartões e status dos alunos.
* **Hospedagem:** Vercel (Serverless Functions).

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
* **Node.js** (versão 18 ou superior)
* **Git**
* Conta configurada no **Supabase**

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone [https://github.com/analoliveira113-ctrl/backend-cartao.git](https://github.com/analoliveira113-ctrl/backend-cartao.git)
   cd backend-cartao
   ```

   ### 📱 Como Usar
1. Aba Cadastro: Insira o nome do aluno, a matrícula e o código do cartão RFID.

2. Aba Consulta: Informe a matrícula e o código do cartão para verificar se ele está cadastrado e qual o seu status.

3. Aba Radar com Mapa: Faça login com suas credenciais do cartão e simule a intensidade de sinal (RSSI). O mapa exibirá a posição aproximada do cartão e o raio de busca em metros.

### 🔗 Links do Projeto (Entregáveis)
- 🌐 Projeto Hospedado (Front-end): https://analoliveira113-ctrl.github.io/frontend-cartao/

- ⚡ API Backend (Vercel): https://backend-cartao.vercel.app/api/teste

- 📂 Repositório GitHub: https://github.com/analoliveira113-ctrl/backend-cartao.git

- 💼 Post no LinkedIn: [COLE AQUI O LINK DO SEU POST NO LINKEDIN]

- 👤 Contato e Autoria

### Squad: 
- Ana Laura Paulino Oliveira;
- Eloize Oliveira Müzel;
- Isabelly Oliveira do Carmo;
- Maria Eduarda da Silva Dias.

## Orientadores / Professores: Adriano Rosa Mazetto e Leandro Gaudio Rosa.

## Instituição: SENAI Gaspar Ricardo Júnior - Sorocaba/SP.
