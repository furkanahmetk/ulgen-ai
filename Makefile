.PHONY: install build dev start test clean

# Projeyi kurmak için tek komut
install:
	@echo "📦 Backend bağımlılıkları yükleniyor (npm install)..."
	cd backend && npm install
	@echo "📦 Frontend bağımlılıkları yükleniyor (npm install)..."
	cd frontend && npm install
	@echo "✅ Tüm bağımlılıklar başarıyla yüklendi!"

# Projeyi derlemek için tek komut
build:
	@echo "🔨 Backend derleniyor..."
	cd backend && npm run build
	@echo "🔨 Frontend derleniyor..."
	cd frontend && npm run build
	@echo "✅ Derleme tamamlandı!"

# Geliştirme (dev) modunda çalıştırmak için
dev:
	@echo "🚀 Geliştirme ortamı başlatılıyor..."
	@bash -c "trap 'kill 0' SIGINT; cd backend && npm run build && npm start & cd frontend && npm run dev & wait"

# Üretim (production) modunda çalıştırmak için
start:
	@echo "🚀 Üretim ortamı başlatılıyor..."
	@bash -c "trap 'kill 0' SIGINT; cd backend && npm start & cd frontend && npm run start & wait"

# Testleri çalıştırmak için
test:
	@echo "🧪 Backend testleri çalıştırılıyor..."
	cd backend && npm test
	@echo "🧪 Frontend testleri çalıştırılıyor..."
	cd frontend && npm test

# Temizlik yapmak için
clean:
	@echo "🧹 node_modules ve build dosyaları temizleniyor..."
	rm -rf backend/node_modules backend/dist
	rm -rf frontend/node_modules frontend/.next
	@echo "✅ Temizlik tamamlandı!"
