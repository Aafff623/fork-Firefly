/* extracted from BackgroundPlayer.astro */
(function () {
  var host = document.getElementById("bg-player");
  if (!host) return;
  var urls = host.getAttribute("data-player-urls") || "[]";
  var playerMode = host.getAttribute("data-player-mode") || "order";
(() => {
		var urlList;
		try {
			urlList = JSON.parse(urls);
		} catch (e) {
			return;
		}
		if (!urlList.length) return;
		var isMultiple = urlList.length > 1;

		var overlay = document.getElementById("bg-player-overlay");
		var video = document.getElementById("bg-player-video");
		var prevBtn = document.getElementById("bg-prev-btn");
		var nextBtn = document.getElementById("bg-next-btn");
		var toast = document.getElementById("bg-player-toast");

		if (!video) return;

		// 防止 is:inline 脚本重复注册监听器（Swup 导航会重新执行脚本）
		if (video.getAttribute("data-player-init")) return;
		video.setAttribute("data-player-init", "true");

		var isPlaying = false;
		var isStarting = false;
		var currentIndex = 0;
		var errorCount = 0;
		var toastTimer = null;
		var primed = false;

		function showToast() {
			if (!toast) return;
			toast.classList.remove("opacity-0");
			toast.classList.add("opacity-100");
			if (toastTimer) clearTimeout(toastTimer);
			toastTimer = setTimeout(function () {
				toast.classList.remove("opacity-100");
				toast.classList.add("opacity-0");
			}, 3000);
		}

		function pickIndex(except) {
			if (urlList.length <= 1) return 0;
			if (playerMode === "random") {
				var n;
				do { n = Math.floor(Math.random() * urlList.length); } while (n === except);
				return n;
			}
			return (except + 1) % urlList.length;
		}

		function prevIndex() {
			if (urlList.length <= 1) return 0;
			if (playerMode === "random") return pickIndex(currentIndex);
			return (currentIndex - 1 + urlList.length) % urlList.length;
		}

		function setLoading(on) {
			document.body.toggleAttribute("data-bg-video-loading", on);
			document.documentElement.toggleAttribute("data-bg-video-loading", on);
		}

		function syncAttr() {
			document.body.toggleAttribute("data-bg-video-playing", isPlaying);
			document.documentElement.toggleAttribute("data-bg-video-playing", isPlaying);
			window.dispatchEvent(new CustomEvent("bg-player-state-change", { detail: { playing: isPlaying } }));
		}

		/** 音乐起播时暂停视频（只停，不反向起播音乐） */
		function pauseDueToMusic() {
			if (!isPlaying && !isStarting) return;
			isPlaying = false;
			isStarting = false;
			video.pause();
			hideOverlay();
			setLoading(false);
			syncAttr();
		}

		function revealOverlay() {
			if (!overlay) return;
			overlay.classList.remove("opacity-0");
			overlay.classList.add("opacity-100");
		}

		function hideOverlay() {
			if (!overlay) return;
			overlay.classList.remove("opacity-100");
			overlay.classList.add("opacity-0");
		}

		function ensureSrc(index) {
			var next = urlList[index];
			if (video.getAttribute("src") !== next) {
				video.src = next;
				video.load();
			}
		}

		/** 空闲时预取当前轨，缩短点击后的等待 */
		function primeCurrent() {
			if (primed) return;
			primed = true;
			ensureSrc(currentIndex);
			try {
				video.preload = "auto";
			} catch (_) {}
		}

		function waitForPlaybackReady() {
			return new Promise(function (resolve, reject) {
				if (video.error) {
					reject(video.error);
					return;
				}
				if (video.readyState >= 3) {
					resolve();
					return;
				}
				var settled = false;
				function done() {
					if (settled) return;
					settled = true;
					cleanup();
					resolve();
				}
				function fail() {
					if (settled) return;
					settled = true;
					cleanup();
					reject(video.error || new Error("video load failed"));
				}
				function cleanup() {
					video.removeEventListener("canplay", done);
					video.removeEventListener("loadeddata", done);
					video.removeEventListener("error", fail);
				}
				video.addEventListener("canplay", done);
				video.addEventListener("loadeddata", done);
				video.addEventListener("error", fail);
			});
		}

		function doPlay() {
			ensureSrc(currentIndex);
			video.muted = true;
			setLoading(true);

			return waitForPlaybackReady()
				.then(function () {
					if (!isPlaying && !isStarting) return;
					// 先盖上黑底+视频层，再播；壁纸图等首帧后再淡出，避免白边闪一下
					revealOverlay();
					return video.play();
				})
				.then(function () {
					if (!isPlaying && !isStarting) return;
					isStarting = false;
					isPlaying = true;
					setLoading(false);
					syncAttr();
					setTimeout(function () {
						if (video && isPlaying) video.muted = false;
					}, 100);
				})
				.catch(function () {
					isStarting = false;
					isPlaying = false;
					setLoading(false);
					hideOverlay();
					syncAttr();
				});
		}

		function switchTrack(index) {
			if (index < 0 || index >= urlList.length) return;
			currentIndex = index;
			primed = false;
			if (isPlaying || isStarting) {
				isStarting = true;
				doPlay();
			} else {
				ensureSrc(currentIndex);
			}
		}

		function toggle() {
			if (isStarting) return;

			if (isPlaying) {
				isPlaying = false;
				video.pause();
				hideOverlay();
				setLoading(false);
				syncAttr();
				return;
			}

			if (currentIndex >= urlList.length) currentIndex = 0;
			isStarting = true;
			setLoading(true);
			// 关键：缓冲完成前不挂 data-bg-video-playing（否则壁纸立刻透明 → 白边）
			window.dispatchEvent(
				new CustomEvent("bg-player-state-change", {
					detail: { playing: false, loading: true },
				}),
			);
			primeCurrent();
			requestAnimationFrame(function () {
				doPlay();
			});
		}

		function onEnded() {
			if (isMultiple) {
				currentIndex = pickIndex(currentIndex);
				isStarting = true;
				doPlay();
			} else {
				isPlaying = false;
				isStarting = false;
				hideOverlay();
				setLoading(false);
				syncAttr();
			}
		}

		function onError() {
			errorCount++;
			if (isMultiple && errorCount < urlList.length) {
				currentIndex = pickIndex(currentIndex);
				ensureSrc(currentIndex);
				if (isPlaying || isStarting) doPlay();
			} else {
				isPlaying = false;
				isStarting = false;
				hideOverlay();
				setLoading(false);
				syncAttr();
				showToast();
			}
		}

		window.addEventListener("bg-player-toggle", toggle);
		// 音乐起播 → 停视频（fm:play-state false 忽略，避免乒乓）
		window.addEventListener("fm:play-state", function (e) {
			var detail = (e && e.detail) || {};
			if (detail.isPlaying) pauseDueToMusic();
		});
		video.addEventListener("ended", onEnded);
		video.addEventListener("error", onError);
		video.addEventListener("playing", function () {
			errorCount = 0;
		});
		if (prevBtn) prevBtn.addEventListener("click", function () { switchTrack(prevIndex()); });
		if (nextBtn) nextBtn.addEventListener("click", function () { switchTrack(pickIndex(currentIndex)); });

		window.addEventListener("wallpaperModeChange", function (e) {
			if (e.detail && e.detail.mode === "none" && (isPlaying || isStarting)) {
				isPlaying = false;
				isStarting = false;
				video.pause();
				hideOverlay();
				setLoading(false);
				syncAttr();
			}
		});

		if (!isMultiple) {
			if (prevBtn) prevBtn.style.display = "none";
			if (nextBtn) nextBtn.style.display = "none";
		}

		// 只在用户悬停或键盘聚焦播放钮后预缓冲，不在页面空闲时抢跑视频。
		var playBtn = document.getElementById("bg-player-toggle");
		if (playBtn) {
			playBtn.addEventListener("pointerenter", primeCurrent, { once: true });
			playBtn.addEventListener("focus", primeCurrent, { once: true });
		}

		function cleanup() {
			if (!isPlaying) {
				document.body.removeAttribute("data-bg-video-playing");
				document.documentElement.removeAttribute("data-bg-video-playing");
			}
			document.body.removeAttribute("data-bg-video-loading");
			document.documentElement.removeAttribute("data-bg-video-loading");
		}
		document.addEventListener("astro:before-swap", cleanup);
	})();
})();
