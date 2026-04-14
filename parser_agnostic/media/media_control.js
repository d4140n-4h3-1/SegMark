// media-control.js
// Ensures only one video or audio element plays at a time.
// Include this script after your Markdown content has been rendered.

(function() {
    'use strict';

    // Keep a reference to the currently playing media element
    let currentMedia = null;

    /**
     * Pause the currently playing media if it exists and is different from the new one.
     * @param {HTMLMediaElement} newMedia - The media that just started playing.
     */
    function pauseOtherMedia(newMedia) {
        if (currentMedia && currentMedia !== newMedia) {
            currentMedia.pause();
        }
        currentMedia = newMedia;
    }

    /**
     * Handle the 'play' event on any media element.
     * @param {Event} e - The event object.
     */
    function onPlay(e) {
        const media = e.target;
        // Only proceed if it's a media element (video or audio)
        if (media instanceof HTMLMediaElement) {
            pauseOtherMedia(media);
        }
    }

    /**
     * Handle the 'ended' event to clear the reference when media finishes naturally.
     * @param {Event} e - The event object.
     */
    function onEnded(e) {
        if (currentMedia === e.target) {
            currentMedia = null;
        }
    }

    // Attach event listeners to the document (capture phase ensures we catch events early)
    document.addEventListener('play', onPlay, true);
    document.addEventListener('ended', onEnded, true);

    // Optional: If you want to also handle cases where media is paused manually,
    // you can add a 'pause' event listener to reset the reference only if it's the current media.
    document.addEventListener('pause', function(e) {
        if (currentMedia === e.target) {
            currentMedia = null;
        }
    }, true);

})();