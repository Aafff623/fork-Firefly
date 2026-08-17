/* extracted from MainGridLayout.astro banner carousel */
(function initBannerCarousel() {
            var container = document.getElementById('banner-images-container');
            if (!container) return;

            var WALLPAPER_BANNER = 'banner';
            var interval = parseInt(container.dataset.carouselInterval || '5000', 10);
            var switchable = container.dataset.carouselSwitchable === 'true';
            var defaultEnabled = container.dataset.carouselEnabled === 'true';
            var effect = container.dataset.carouselEffect || 'fade';
            var transitioning = false;

            // 构建期只写 URL 清单；运行时仅物化当前设备的下一帧。
            var rest = { mobile: [], desktop: [] };
            var raw = container.getAttribute('data-carousel-rest');
            if (raw) {
                try {
                    var parsed = JSON.parse(raw);
                    if (parsed) rest = parsed;
                } catch (e) { /* 保留首帧，轮播自然退化 */ }
            }
            container.removeAttribute('data-carousel-rest');

            var catalogs = {
                mobile: [null].concat(Array.isArray(rest.mobile) ? rest.mobile : []),
                desktop: [null].concat(Array.isArray(rest.desktop) ? rest.desktop : [])
            };

            function getDeviceKind() {
                return window.innerWidth >= 1024 ? 'desktop' : 'mobile';
            }

            function getTotalSlides() {
                return catalogs[getDeviceKind()].length;
            }

            // 物化上限：自动播放默认只物化 3(mobile)/4(desktop) 张，手动操作可强制多物化
            var MATERIALIZE_MAX = { mobile: 3, desktop: 4 };

            function getMaterializedSlides(kind) {
                return container.querySelectorAll('.slide-item[data-device="' + kind + '"]');
            }

            function getMaterializedCount(kind) {
                return getMaterializedSlides(kind).length;
            }

            function ensureSlide(kind, index, force) {
                var existing = container.querySelector(
                    '.slide-item[data-device="' + kind + '"][data-index="' + index + '"]'
                );
                if (existing) return existing;

                var item = catalogs[kind][index];
                if (!item || !item.src) return null;

                if (!force && getMaterializedCount(kind) >= MATERIALIZE_MAX[kind]) return null;

                var div = document.createElement('div');
                div.className = kind === 'desktop'
                    ? 'slide-item hidden lg:block'
                    : 'slide-item block lg:hidden';
                div.setAttribute('data-device', kind);
                div.setAttribute('data-index', String(index));

                var img = document.createElement('img');
                img.alt = 'Background image of the blog';
                img.className = 'object-cover h-full w-full';
                img.loading = 'eager';
                img.fetchPriority = 'low';
                img.decoding = 'async';
                if (item.srcset) img.setAttribute('srcset', item.srcset);
                if (item.sizes) img.sizes = item.sizes;
                img.src = item.src;
                img.style.objectPosition = item.position || 'center';
                div.appendChild(img);
                container.appendChild(div);
                return div;
            }

            function preloadNextSlide(currentIndex) {
                var total = getTotalSlides();
                if (total <= 1) return;
                ensureSlide(getDeviceKind(), (currentIndex + 1) % total);
            }

            // 已达物化上限时，自动播放取当前已物化 slide 的下一个 index（不足则回绕到最小）
            function getNextMaterializedIndex(kind, currentIndex) {
                var slides = getMaterializedSlides(kind);
                var indices = [];
                for (var i = 0; i < slides.length; i++) {
                    var idx = parseInt(slides[i].getAttribute('data-index') || '0', 10);
                    if (!Number.isNaN(idx)) indices.push(idx);
                }
                if (indices.length === 0) return currentIndex;
                indices.sort(function(a, b) { return a - b; });
                for (var j = 0; j < indices.length; j++) {
                    if (indices[j] > currentIndex) return indices[j];
                }
                return indices[0];
            }

            // 切换落定后清理远离当前帧的闲置 slide；延迟到过渡动画结束再摘除，避免切断淡出
            function cleanupStaleSlides(kind, currentIndex) {
                var slides = getMaterializedSlides(kind);
                for (var i = 0; i < slides.length; i++) {
                    var el = slides[i];
                    if (el.classList.contains('active')) continue;
                    var idx = parseInt(el.getAttribute('data-index') || '0', 10);
                    if (Number.isNaN(idx)) continue;
                    if (Math.abs(idx - currentIndex) <= 2) continue;
                    (function(elm) {
                        setTimeout(function() {
                            if (elm.parentNode === container && !elm.classList.contains('active')) {
                                container.removeChild(elm);
                            }
                        }, 1200);
                    })(el);
                }
            }

            function isCarouselEnabled() {
                if (!switchable) return defaultEnabled;
                var stored = localStorage.getItem('bannerCarouselEnabled');
                if (stored === null) return defaultEnabled;
                return stored === 'true';
            }

            function isBannerWallpaperMode() {
                var mode = document.documentElement.getAttribute('data-wallpaper-mode');
                return mode === WALLPAPER_BANNER || mode === 'fullscreen';
            }

            // 获取当前设备可见的 slide-item
            function getVisibleSlides() {
                var kind = getDeviceKind();
                var all = container.querySelectorAll('.slide-item[data-device="' + kind + '"]');
                var visible = [];
                for (var i = 0; i < all.length; i++) {
                    visible.push(all[i]);
                }
                return visible;
            }

            function getCurrentIndex(slides) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i].classList.contains('active')) {
                        var index = parseInt(slides[i].getAttribute('data-index') || '0', 10);
                        return Number.isNaN(index) ? 0 : index;
                    }
                }
                return 0;
            }

            function emitBannerSlide(index, total) {
                // 氛围层等同频跟图：广播当前可见横幅下标
                try {
                    window.dispatchEvent(new CustomEvent('firefly:banner-slide', {
                        detail: { index: index, total: total }
                    }));
                } catch (err) { /* ignore */ }
            }

            function applySlideChange(slides, nextIndex) {
                // Slide 效果需要 prev-waiting 辅助类
                if (effect === 'slide') {
                    for (var i = 0; i < slides.length; i++) {
                        var slideIndex = parseInt(slides[i].getAttribute('data-index') || '0', 10);
                        slides[i].classList.remove('prev-waiting');
                        if (slideIndex < nextIndex) slides[i].classList.add('prev-waiting');
                    }
                }
                if (effect === 'kenburns') {
                    // Ken Burns: 交叉淡入淡出，先激活新图再隐藏旧图
                    for (var k = 0; k < slides.length; k++) {
                        if (parseInt(slides[k].getAttribute('data-index') || '0', 10) === nextIndex) {
                            slides[k].classList.add('active');
                        }
                    }
                    requestAnimationFrame(function() {
                        for (var j = 0; j < slides.length; j++) {
                            if (parseInt(slides[j].getAttribute('data-index') || '0', 10) !== nextIndex) {
                                slides[j].classList.remove('active');
                            }
                        }
                    });
                } else {
                    for (var j = 0; j < slides.length; j++) {
                        if (parseInt(slides[j].getAttribute('data-index') || '0', 10) === nextIndex) slides[j].classList.add('active');
                        else slides[j].classList.remove('active');
                    }
                }
                emitBannerSlide(nextIndex, getTotalSlides());
            }

            function changeToSlide(targetIndex, resetProgress, force) {
                var total = getTotalSlides();
                if (total <= 1) return;
                if (transitioning) return;

                var nextIndex = targetIndex;
                if (nextIndex >= total) nextIndex = 0;
                else if (nextIndex < 0) nextIndex = total - 1;

                var kind = getDeviceKind();
                var slides = getVisibleSlides();
                var currentIndex = getCurrentIndex(slides);
                if (nextIndex === currentIndex) return;

                var targetSlide = ensureSlide(kind, nextIndex, force);
                if (!targetSlide) {
                    // 已达物化上限：自动播放退化为在已物化 slide 内循环；手动操作失败则放弃
                    if (force) return;
                    nextIndex = getNextMaterializedIndex(kind, currentIndex);
                    if (nextIndex === currentIndex) return;
                    targetSlide = ensureSlide(kind, nextIndex, true);
                    if (!targetSlide) return;
                }

                function commitSlideChange() {
                    transitioning = false;
                    applySlideChange(getVisibleSlides(), nextIndex);
                    preloadNextSlide(nextIndex);
                    cleanupStaleSlides(kind, nextIndex);

                    if (resetProgress !== false && appState.isPlaying) {
                        startAutoPlay();
                    }
                }

                var image = targetSlide.querySelector('img');
                if (image && !image.complete) {
                    transitioning = true;
                    image.addEventListener('load', commitSlideChange, { once: true });
                    image.addEventListener('error', function() {
                        transitioning = false;
                    }, { once: true });
                } else {
                    commitSlideChange();
                }
            }

            var appState = {
                isPlaying: false,
                autoPlayTimer: null,
                touchStartX: 0,
                touchEndX: 0
            };

            function startAutoPlay() {
                stopAutoPlay();
                if (!isCarouselEnabled()) return;
                if (!isBannerWallpaperMode()) return;

                appState.isPlaying = true;
                appState.autoPlayTimer = setTimeout(function advance() {
                    if (!appState.isPlaying) return;
                    var slides = getVisibleSlides();
                    var currentIdx = getCurrentIndex(slides);
                    changeToSlide(currentIdx + 1, false);
                    appState.autoPlayTimer = setTimeout(advance, interval);
                }, interval);
            }

            function stopAutoPlay() {
                appState.isPlaying = false;
                if (appState.autoPlayTimer) {
                    clearTimeout(appState.autoPlayTimer);
                    appState.autoPlayTimer = null;
                }
            }

            // 键盘控制
            document.addEventListener('keydown', function(e) {
                if (!isBannerWallpaperMode() || !isCarouselEnabled()) return;
                if (e.key === 'ArrowRight') {
                    var slides = getVisibleSlides();
                    changeToSlide(getCurrentIndex(slides) + 1, undefined, true);
                } else if (e.key === 'ArrowLeft') {
                    var slides2 = getVisibleSlides();
                    changeToSlide(getCurrentIndex(slides2) - 1, undefined, true);
                } else if (e.key === ' ') {
                    e.preventDefault();
                    appState.isPlaying ? stopAutoPlay() : startAutoPlay();
                }
            });

            // 触屏滑动
            document.addEventListener('touchstart', function(e) {
                appState.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            document.addEventListener('touchend', function(e) {
                appState.touchEndX = e.changedTouches[0].screenX;
                var diff = appState.touchEndX - appState.touchStartX;
                if (Math.abs(diff) > 50) {
                    var slides = getVisibleSlides();
                    if (diff > 0) changeToSlide(getCurrentIndex(slides) - 1, undefined, true);
                    else changeToSlide(getCurrentIndex(slides) + 1, undefined, true);
                }
            }, { passive: true });

            // 事件监听
            window.addEventListener('bannerCarouselChange', function(e) {
                e.detail && e.detail.enabled ? startAutoPlay() : stopAutoPlay();
            });
            window.addEventListener('wallpaperModeChange', function(e) {
                if (e.detail && (e.detail.mode === 'banner' || e.detail.mode === 'fullscreen')) {
                    if (isCarouselEnabled()) startAutoPlay();
                } else {
                    stopAutoPlay();
                }
            });

            // 首帧固定为 SSR 的第 0 张，避免先请求一张再随机跳到另一张。
            var slides = getVisibleSlides();
            var bootIdx = 0;
            if (slides.length > 0) {
                emitBannerSlide(bootIdx, getTotalSlides());
            }

            // 启动
            if (isCarouselEnabled() && isBannerWallpaperMode()) {
                startAutoPlay();
            }
        })();
