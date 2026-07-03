# Sentinel AI - Deployment Guide (Vercel & Render)

Sentinel AI projesi iki ana parçadan oluşur: **Frontend** (Next.js) ve **Backend** (Express.js + AI Ajanı). 

İkisini de Vercel'e yüklemek mümkündür. (Aynı repo üzerinden Vercel'de 2 ayrı proje açarak birini frontend, diğerini backend olarak yapılandırabilirsin). Ancak backend tarafında AI ajanının (Gemini) yanıt süresi uzun olabileceği için Vercel'in ücretsiz sürümündeki 10 saniyelik serverless function timeout limitine takılma ihtimali vardır. Bu yüzden Frontend için Vercel, Backend için ise Render.com (veya VPS) kullanımı **en ideal** senaryodur. 

Aşağıda tüm adımlar hem frontend hem de backend için ayrı ayrı açıklanmıştır.

---

## 🟢 Bölüm 1: Frontend'i Vercel'e Yükleme

1. Tüm kodlarının GitHub'da güncel olduğundan emin ol (`git push` işlemini tamamla).
2. [Vercel](https://vercel.com) adresine git ve GitHub hesabınla giriş yap.
3. Sağ üstteki **"Add New..." > "Project"** butonuna tıkla.
4. Çıkan listeden **`sentinel-ai`** (veya deponun adı neyse) reposunu bulup **"Import"** butonuna bas.

### ⚠️ Çok Önemli: "Root Directory" Ayarı
Vercel varsayılan olarak projenin ana dizinini arar, ancak bizim Next.js kodumuz `frontend` klasörü içinde.
- **Root Directory** seçeneğinin yanındaki "Edit" butonuna tıkla.
- Listeden **`frontend`** klasörünü seç ve kaydet.

### 🔐 Environment Variables (Ortam Değişkenleri)
> **💡 Önemli Soru:** "Direkt Deploy dedim, Environment Variable'ları baştan ayarlamadım. Sonradan ekleyebilir miyim?"
> **Cevap:** Evet, kesinlikle! Vercel'de veya Render'da ayarlar kısmından bu değişkenleri sonradan ekleyip projeyi "Redeploy" (yeniden başlat) yapabilirsin. Başlangıçta girmeden deploy etmekte hiçbir sakınca yoktur.

Aynı ekranda **"Environment Variables"** sekmesini aç ve kendi `.env.local` dosyasındaki ayarları buraya ekle:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://senin-backend-url.com` *(Backend'i canlıya aldıktan sonra bu URL'i gireceksin)* |
| `NEXT_PUBLIC_CSPR_CLICK_APP_NAME` | `Sentinel AI` |
| `NEXT_PUBLIC_CSPR_CLICK_APP_ID` | `your_cspr_click_app_id_here` *(Get yours at [cspr.click](https://cspr.click))* |
| `NEXT_PUBLIC_CASPER_CHAIN_NAME` | `casper-test` |
| `NEXT_PUBLIC_CASPER_NODE_URL` | `https://rpc.testnet.casperlabs.io/rpc` |

Değerleri ekledikten sonra **"Deploy"** butonuna bas!
(Eğer değişkenleri girmeden deploy dediysen, proje sayfasına gidip üst menüden **Settings > Environment Variables** kısmından sonradan ekleyip, **Deployments** sekmesinden en üstteki satırın sağındaki üç noktaya (⋮) tıklayarak **"Redeploy"** yapman yeterlidir.)

---

## 🟢 Bölüm 2: Backend'i Canlıya Alma

Backend'i Vercel'e veya Render'a yükleyebilirsin. İşte ikisi için de ayrı adımlar:

### Seçenek A: Backend'i Vercel'e Yükleme (Serverless API)
Backend kodunu (Express) Vercel üzerinde çalıştırmak için aynı repo ile Vercel'de 2. bir proje açacağız.

1. Vercel Dashboard'da tekrar **"Add New..." > "Project"** butonuna tıkla ve aynı Github reposunu tekrar "Import" et.
2. Bu sefer **Root Directory** olarak listenden **`backend`** klasörünü seç ve kaydet.
3. Framework Preset olarak **"Other"** veya **"Node.js"** seçili kalabilir.
4. Build Command olarak `npm run build` (veya Vercel otomatik algılayacaktır) kullanıldığından emin ol.
5. **Environment Variables** kısmına bilgisayarındaki `backend/.env` dosyasındaki tüm ayarları (Google API, CSPR Cloud API vb.) ekle. *(Bunu da tıpkı frontend gibi sonradan ayarlayıp redeploy edebilirsin).*
6. **"Deploy"** butonuna bas. Vercel sana bir backend API linki verecektir (örn: `https://sentinel-ai-backend.vercel.app`).
7. Bu linki kopyalayıp, Frontend Vercel projenin Settings kısmına giderek `NEXT_PUBLIC_API_URL` değişkeni olarak tanımla ve Frontend'i redeploy et.
*(Not: Ücretsiz Vercel hesabında Serverless fonksiyonların çalışma limiti 10 saniyedir. Gemini AI istekleri uzun sürer ve 10 saniyeyi geçerse Vercel 504 Timeout hatası verebilir. Eğer böyle bir sorun yaşarsan Seçenek B'ye geçebilirsin.)*

### Seçenek B: Backend'i Render.com'a Yükleme (Alternatif - Önerilen)
AI ajanının (long-running process) timeout (zaman aşımı) sorunu yaşamadan her zaman açık kalması için çok sağlıklı bir alternatiftir:

1. [Render.com](https://render.com)'a gir.
2. "New Web Service" seç ve Github reponu bağla.
3. **Root Directory:** `backend`
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npm start`
6. **Environment Variables** kısmına bilgisayarındaki `backend/.env` içerisindeki tüm değerleri (Google API, CSPR Cloud vb.) tek tek ekle.
7. Deploy et. Render sana bir link verecek (örn: `https://sentinel-backend.onrender.com`).
8. Bu linki kopyala, Vercel'deki Frontend projenin ayarlarına git, `NEXT_PUBLIC_API_URL` değişkenini bu yeni link ile değiştir ve Frontend'i **Redeploy** yap.

### Seçenek C: Backend'i Sadece Lokal Bilgisayarında Çalıştırmak (Test Amaçlı)
Sadece arayüzün canlıda nasıl durduğunu görmek ve hızlıca test etmek istiyorsan backend'i deploy etmene gerek yoktur:
1. Bilgisayarında terminali aç.
2. `cd backend`
3. `npm run dev` diyerek backend'i lokalde (3001 portunda) açık bırak.
4. Vercel'deki Frontend ayarlarında `NEXT_PUBLIC_API_URL` değişkenine `http://localhost:3001` değerini ver ve redeploy et.
*(Not: Canlı bir web sitesinden (https), lokal bilgisayarına (http) istek atarken tarayıcı güvenlik politikaları gereği bazen "Mixed Content" veya CORS hatası alınabilir. Bunu aşmak için ngrok kullanabilir veya Seçenek A/B'ye geçebilirsin.)*

---

## 🟢 Adım 3: CSPR.click Ayarlarını Güncelleme (Canlıya Aldıktan Sonra)

Frontend projen Vercel'de canlıya alındığında sana bir URL verilecek (örneğin: `https://sentinel-ai.vercel.app`).
1. [CSPR.click Dashboard](https://cspr.click)'a geri dön.
2. Oluşturduğun uygulamanın ayarlarına gir.
3. **"Domains"** kısmındaki `example.com` veya `localhost` değerini sil.
4. Vercel'in sana verdiği **canlı linki** (örn: `sentinel-ai.vercel.app`) buraya ekle ve kaydet. (Başına https:// koymadan yaz).

Artık canlı sitene girdiğinde Casper cüzdanı sorunsuz bir şekilde açılacak ve Sentinel AI ajanı tamamen otonom olarak çalışacaktır!
