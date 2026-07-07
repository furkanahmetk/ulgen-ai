# Sentinel AI: Deployment Guide

Bu rehber, Sentinel AI projesini üretim (production) ortamında nasıl kuracağınızı ve çalıştıracağınızı açıklar. Uygulamanın en verimli şekilde çalışması için Frontend ve Backend bileşenlerinin bağlantısının doğru yapılması kritiktir.

## 🏗️ Mimari ve Bileşenlerin Bağlantısı

Frontend ve Backend ayrı alan adlarında veya portlarda çalıştığında aralarındaki bağlantıyı sağlamak için iki kritik ayar yapılmalıdır:

1. **Frontend'in Backend'i Bulması**: Frontend `.env` dosyasındaki `NEXT_PUBLIC_API_URL` değişkeni, Backend'in çalıştığı tam adrese (örneğin `https://api.sentinel-ai.com` veya `http://VPS_IP:3001`) işaret etmelidir.
2. **Backend'in Frontend'e İzin Vermesi (CORS)**: Backend kodunda (`backend/src/server.ts`), Frontend'in alan adından gelecek isteklere CORS üzerinden izin verilmesi gerekmektedir. 

---

## 🛠️ Hızlı Kurulum (Makefile ve Bağımlılıklar)

Projede Python yerine Node.js kullanıldığı için standart bir `requirements.txt` yerine bağımlılıklar `package.json` üzerinden yönetilmektedir. Ancak, süreci otomatize etmek için sistemde bir **Makefile** bulunmaktadır.

Projeyi tek bir komutla kurmak, derlemek ve başlatmak için terminalde proje ana dizininde şu komutları kullanabilirsiniz:

- **Kurulum (Tüm gereksinimleri yükler):** `make install`
- **Geliştirme Modunda Çalıştırma:** `make dev` (Hem frontend hem backend başlar)
- **Derleme (Production build):** `make build`
- **Üretim Modunda Çalıştırma:** `make start`
- **Testleri Çalıştırma:** `make test`

Proje kök dizininde bulunan `requirements.txt` dosyası üzerinden sistemin ihtiyaç duyduğu temel Node.js versiyonlarını kontrol edebilirsiniz.

---

## 1. Backend Kurulumu (VPS Üzerinde)

Backend bir Node.js Express sunucusudur. VPS (Sanal Özel Sunucu) üzerinde sürekli çalışmasını sağlamak için `pm2` kullanılması önerilir.

### Adım 1: PM2 ve Bağımlılıkların Kurulumu
VPS sunucunuza SSH ile bağlanın ve Node.js'in kurulu olduğundan emin olun.
```bash
# PM2'yi global olarak kurun
npm install -g pm2 typescript

# Proje dizinine gidin ve bağımlılıkları yükleyin
cd /path/to/sentinel-ai
make install
make build
```

### Adım 2: Çevre Değişkenleri (Environment Variables)
`backend/` dizini içinde bir `.env` dosyası oluşturun ve gerekli değişkenleri girin:
```env
PORT=3001
NODE_ENV=production

# Casper & CSPR.cloud
CASPER_NODE_URL=https://node.testnet.casper.network/rpc
CASPER_CHAIN_NAME=casper-test
CSPR_CLOUD_API_KEY=your_cspr_cloud_api_key_here
CSPR_CLOUD_REST_URL=https://api.testnet.cspr.cloud

# Smart Contracts
MARKETPLACE_CONTRACT_HASH=hash-81f425ad385a...
REGISTRY_CONTRACT_HASH=hash-31da4afad7ae...

# Wallet Config
AGENT_SECRET_KEY_PATH=./agent_keys/secret_key.pem

# LLM APIs
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=google/gemma-3-27b-it
```

### Adım 3: CORS Ayarları
Frontend'in IP adresine veya Vercel alan adına izin vermek için `backend/src/server.ts` içinde CORS ayarlarını düzenleyin:
```typescript
app.use(cors({
    origin: ['https://sentinel-ai.vercel.app', 'http://Sizin_Frontend_VPS_IP:3000'],
    methods: ['GET', 'POST']
}));
```

### Adım 4: PM2 ile Başlatma
```bash
cd backend
pm2 start dist/src/server.js --name "sentinel-backend"
pm2 save
pm2 startup
```
Backend artık `http://VPS_IP:3001` adresinde yayın yapıyor olacaktır.

---

## 2. Frontend Kurulum Opsiyonları

Frontend için iki farklı kurulum opsiyonu bulunmaktadır: VPS üzerinden kendi sunucunuzda barındırma veya Vercel üzerinden serverless (sunucusuz) dağıtım.

### Opsiyon A: VPS Üzerine Frontend Kurulumu (Önerilen: PM2)

Eğer Frontend'i de Backend ile aynı VPS'te barındırmak istiyorsanız:

1. **Çevre Değişkenlerini Ayarlayın:**
   `frontend/` dizininde `.env` dosyası oluşturun:
   ```env
   # Backend'in adresi (Aynı sunucudaysa IP adresini yazabilirsiniz)
   NEXT_PUBLIC_API_URL=http://VPS_IP:3001
   NEXT_PUBLIC_CSPR_CLICK_APP_NAME="Sentinel AI"
   ```

2. **Derleme ve Başlatma:**
   ```bash
   cd frontend
   npm run build
   pm2 start npm --name "sentinel-frontend" -- start
   pm2 save
   ```
   Frontend artık `http://VPS_IP:3000` adresinde çalışacaktır. Nginx kullanarak 80 (HTTP) veya 443 (HTTPS) portlarına yönlendirme yapabilirsiniz.

### Opsiyon B: Vercel Üzerine Frontend Kurulumu (Daha Kolay)

Vercel, Next.js uygulamaları için mükemmel bir barındırma sunar.

1. [Vercel Dashboard](https://vercel.com/dashboard) üzerinden **Add New > Project** diyerek GitHub deponuzu içe aktarın.
2. **Root Directory (Kök Dizin)** olarak `frontend` klasörünü seçin.
3. **Environment Variables** bölümüne şunları ekleyin:
   ```env
   # Backend VPS'nizin veya Render/Heroku adresiniz
   NEXT_PUBLIC_API_URL=http://VPS_IP_VEYA_ALAN_ADI:3001
   NEXT_PUBLIC_CSPR_CLICK_APP_NAME="Sentinel AI"
   ```
4. **Deploy** butonuna tıklayın. Vercel size otomatik olarak bir alan adı atayacaktır (ör. `https://sentinel-ai.vercel.app`).
5. Vercel alan adınızı, Backend'in CORS ayarlarına eklemeyi unutmayın!

---

## 3. Kurulum Sonrası Doğrulama

1. **Backend Testi:** Tarayıcınızdan `http://VPS_IP:3001/api/investigations` adresine gidin. Boş bir dizi `[]` görüyorsanız sistem çalışıyor demektir.
2. **Frontend Bağlantı Testi:** Frontend arayüzünüze girip (Vercel URL'si veya VPS IP'si) "Network" sekmesinden (F12) Backend'e yapılan isteklerin doğru adrese (localhost yerine VPS/Vercel URL'sine) gittiğinden emin olun.
3. **CSPR.click Testi:** Casper cüzdan bağlantısının sorunsuz çalıştığını kontrol edin.
