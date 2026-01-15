# 1. Install LFS & fix hook path
sudo apt-get update && \
  sudo apt-get install -y git-lfs

mkdir -p ~/.git-hooks
git config --global core.hooksPath \
  ~/.git-hooks

# 2. Skip smudge during init
git config --global filter.lfs.smudge \
  "git-lfs smudge --skip -- %f"
git lfs install

# 3. Bypass Jules internal proxy
git config --global --unset-all \
  url.http://git@192.168.0.1:8080/.insteadOf

# 4. Set LFS remote and pull
cd /app
git config lfs.url \
  "https://github.com/jpoehnelt/blog.git/info/lfs"

git config \
  lfs.https://github.com/jpoehnelt/blog.git/info/lfs.locksverify \
  false

git lfs pull