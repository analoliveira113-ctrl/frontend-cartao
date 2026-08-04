# 💳 Meu Cartão SENAI - Sistema de Localização e Gestão RFID

> Solução IoT e Web desenvolvida para mitigar o problema de perda e localização de cartões estudantis RFID no contexto do SENAI.

---

## 📌 Título e Descrição

O **Meu Cartão SENAI** é um sistema web e API criado para solucionar e otimizar a gestão de cartões de identificação de estudantes nas unidades do SENAI. 

Através da plataforma, o aluno pode:
* **Cadastrar** seu cartão de estudante e vincular à sua matrícula.
* **Consultar** a situação do cartão em tempo real.
* **Simular e rastrear** a localização do cartão via sinal de radiofrequência (RSSI) com visualização em mapa interativo georreferenciado.

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
   git clone [https://github.com/SEU-USUARIO/meu-cartao-senai.git](https://github.com/SEU-USUARIO/meu-cartao-senai.git)
   cd meu-cartao-senai
