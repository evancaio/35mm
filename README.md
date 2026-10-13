# Sessão 35mm — Roleta Cinematográfica Curada

> Uma experiência cinematográfica interativa e elegante inspirada no design da Apple TV+ e nas premiações do Awwwards.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

## 🎬 Sobre o Projeto

Não sabe o que assistir hoje? A **Sessão 35mm** resolve a paralisia de escolha através de uma curadoria refinada de **80 clássicos e obras aclamadas do cinema mundial**, distribuídos em 4 salas temáticas exclusivas.

### 🏛️ As 4 Salas em Cartaz
1. **Sessão 01 — Roleta Mista**: Clássicos variados, cinema cult e obras premiadas sem amarras de gênero (*Pulp Fiction, Parasita, Interestelar, Cidade de Deus...*).
2. **Sessão 02 — Roleta Terror**: Calafrios, suspense psicológico e obras atmosféricas (*O Iluminado, Hereditário, O Silêncio dos Inocentes, Corra!...*).
3. **Sessão 03 — Roleta Ação**: Alta octanagem, perseguições épicas e sequências lendárias (*Mad Max: Estrada da Fúria, Matrix, O Cavaleiro das Trevas, O Exterminador do Futuro 2...*).
4. **Sessão 04 — Roleta Drama**: Cinema de autor, atuações viscerais e reflexões profundas (*O Poderoso Chefão, Clube da Luta, O Resgate do Soldado Ryan, O Show de Truman...*).

---

## ✨ Recursos & Diferenciais Técnicos

- **100% Front-End & Zero Dependências:** Construído inteiramente com HTML5 semântico, Vanilla CSS contemporâneo e Vanilla JavaScript.
- **Full-Bleed Cinema Cards:** Cards imersivos com pôsteres em alta definição, microinterações, profundidade e iluminação reativa por gênero.
- **The Living Vault:** Mural contínuo com os 80 clássicos em movimento perpétuo.
- **Motor Físico da Roleta (Canvas API):** Giro mecânico com aceleração suave, inércia não linear e desaceleração por atrito com física natural.
- **Web Audio API Sintetizado:** Efeitos sonoros procedurais de catraca mecânica, clique e fanfarra gerados via código, sem arquivos pesados de áudio.
- **Sistema Sem Repetição:** Sorteios sem repetição dentro da mesma sessão usando persistência local (`localStorage`).
- **Ficha Técnica & Onde Assistir:** Modal editorial revelando pôster com efeito glow, nota IMDb, duração, sinopse, diretor e plataformas de streaming oficiais.

---

## 🚀 Como Executar Localmente

Como o projeto é 100% estático, você pode executá-lo diretamente:

```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/roleta-filmes.git

# Acesse o diretório
cd roleta-filmes

# Abra o index.html no navegador ou use qualquer servidor local:
npx serve .
# ou
python -m http.server 8080
```

---

## ☁️ Deploy no Vercel

### Opção 1: Via GitHub (Recomendado)
1. Crie um repositório no seu GitHub e envie o código (`git push origin main`).
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**.
3. Importe o repositório do GitHub.
4. Clique em **Deploy** (a Vercel detecta automaticamente como site estático).

### Opção 2: Via Vercel CLI
Execute no terminal:
```bash
npx vercel
```
Siga as instruções rápidas no terminal para publicar instantaneamente.
