#!/data/data/com.termux/files/usr/bin/bash
set -e
REPO_URL="https://github.com/sefedinbejawi-sys/souq_eloued.git"

pkg install git nodejs -y
npm install
npm run typecheck
npm run build

if [ ! -d .git ]; then
  git init
fi

git add .
if git diff --cached --quiet; then
  echo "لا توجد تغييرات جديدة للرفع."
else
  read -r -p "رسالة الـ commit (اتركها فارغة للافتراضي): " MSG
  git commit -m "${MSG:-Update souq el oued professional marketplace}"
fi

git branch -M main
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REPO_URL"
fi

if ! git push -u origin main; then
  echo "فشل الرفع المباشر، أحاول الدمج مع تاريخ المستودع الحالي..."
  git pull origin main --allow-unrelated-histories
  git push -u origin main
fi
