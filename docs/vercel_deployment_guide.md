# Sentinel AI - Vercel Deployment Guide

Sentinel AI projesi iki ana parçadan oluşur: **Frontend** (Next.js) ve **Backend** (Express.js + AI Ajanı). 

Vercel, Next.js projeleri (Frontend) için dünyanın en iyi platformlarından biridir. Ancak yapay zeka ajanının arka planda sürekli çalışması, blokzincir ödemeleri (x402) yapması ve cüzdan işlemlerini güvenli bir şekilde yönetmesi gerektiğinden, Backend kısmını **Render, Railway veya bir VPS** (DigitalOcean vb.) üzerinde barındırmak çok daha sağlıklıdır.

Bu rehberde **Frontend'i Vercel'e**, **Backend'i ise (geçici olarak lokalde veya Render'da)** nasıl çalıştıracağını görebilirsin.

---

## 🟢 Adım 1: Frontend'i Vercel'e Yükleme

1. Tüm kodlarının GitHub'da güncel olduğundan emin ol (`git push` işlemini tamamla).
2. [Vercel](https://vercel.com) adresine git ve GitHub hesabınla giriş yap.
3. Sağ üstteki **"Add New..." > "Project"** butonuna tıkla.
4. Çıkan listeden **`sentinel-ai`** (veya deponun adı neyse) reposunu bulup **"Import"** butonuna bas.

### ⚠️ Çok Önemli: "Root Directory" Ayarı
Vercel varsayılan olarak projenin ana dizinini arar, ancak bizim Next.js kodumuz `frontend` klasörü içinde.
- **Root Directory** seçeneğinin yanındaki "Edit" butonuna tıkla.
- Listeden **`frontend`** klasörünü seç ve kaydet.

### 🔐 Adım 2: Environment Variables (Ortam Değişkenleri)
Aynı ekranda **"Environment Variables"** sekmesini aç ve kendi `.env.local` dosyasındaki ayarları buraya ekle:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` *(Eğer backend lokalindeyse bunu yaz, backend'i internete açarsan o linki yazacaksın)* |
| `NEXT_PUBLIC_CSPR_CLICK_APP_NAME` | `Sentinel AI` |
| `NEXT_PUBLIC_CSPR_CLICK_APP_ID` | `8f76a652-4332-44cd-9c97-585550d7` *(Senin App ID'n)* |
| `NEXT_PUBLIC_CASPER_CHAIN_NAME` | `casper-test` |
| `NEXT_PUBLIC_CASPER_NODE_URL` | `https://rpc.testnet.casperlabs.io/rpc` |

Değerleri ekledikten sonra **"Deploy"** butonuna bas! Yaklaşık 1-2 dakika içinde arayüzün canlıya alınmış olacak.

---

## 🟢 Adım 3: CSPR.click Ayarlarını Güncelleme (Canlıya Aldıktan Sonra)

Vercel sana canlı bir URL verecek (örneğin: `https://sentinel-ai.vercel.app`).
1. [CSPR.click Dashboard](https://cspr.click)'a geri dön.
2. Oluşturduğun uygulamanın ayarlarına gir.
3. **"Domains"** kısmındaki `example.com` veya `localhost` değerini sil.
4. Vercel'in sana verdiği **canlı linki** (örn: `sentinel-ai.vercel.app`) buraya ekle ve kaydet. (Başına https:// koymadan yaz).

Artık canlı sitene girdiğinde Casper cüzdanı sorunsuz bir şekilde açılacaktır!

---

## 🟢 Adım 4: Backend'i Çalıştırma

Vercel'deki canlı siten, işlemlerini (AI raporlamaları) yapabilmek için senin backend'ine (`NEXT_PUBLIC_API_URL`) istek atacaktır.

### Seçenek A: Backend'i Kendi Bilgisayarında Çalıştırmak (Geliştirme için en kolayı)
Sadece arayüzün canlıda nasıl durduğunu görmek ve test etmek istiyorsan:
1. Bilgisayarında terminali aç.
2. `cd backend`
3. `npm run dev` diyerek backend'i lokalde (3001 portunda) açık bırak.
4. Canlı Vercel siten, senin bilgisayarındaki bu backend'e istek atacaktır (Ancak tarayıcı güvenlik politikaları gereği, canlı siteden http://localhost'a istek atmak bazen CORS hatası verebilir. Eğer bu olursa ngrok kullanmalısın veya Seçenek B'ye geçmelisin).

### Seçenek B: Backend'i Render.com'a Yüklemek (Tamamen Canlı)
AI ajanının her zaman açık kalması için:
1. [Render.com](https://render.com)'a gir.
2. "New Web Service" seç ve Github reponu bağla.
3. **Root Directory:** `backend`
4. **Build Command:** `npm install`
5. **Start Command:** `npm run start` (veya `npm run dev`)
6. Environment Variables kısmına senin bilgisayarındaki `backend/.env` içerisindeki tüm değerleri (Google API, CSPR Cloud vb.) tek tek ekle.
7. Deploy et. Render sana bir link verecek (örn: `sentinel-backend.onrender.com`).
8. Vercel'e geri dönüp `NEXT_PUBLIC_API_URL` değişkenini bu yeni link ile değiştir ve projeyi yeniden (redeploy) başlat.

İşte bu kadar! Artık Sentinel AI baştan uca canlıda!
