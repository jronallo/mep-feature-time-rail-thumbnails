(function($) {

  $.extend(MediaElementPlayer.prototype, {
    buildtimerailthumbnails : function(player, controls, layers, media) {
      if (!player.isVideo)
        return;

      // This relies on mutation observers right now, so if those aren't available just
      // abandon it.
      if (!window.MutationObserver)
        return;

      // Check for presence of WebVTT
      if (!WebVTT) {
        console.log('mep-feature-time-rail-thumbnails.js requires vtt.js');
        return;
      }

      function getVttCues(url) {
        var vtt,
        parser = new WebVTT.Parser(window, WebVTT.StringDecoder()),
        cues = [];

        // FIXME: Is there a way to do this with promises?
        $.ajax({
          url: url,
          async: false,
          success: function(data){
            vtt = data;
          },
          error:function (xhr, ajaxOptions, thrownError){
            if(xhr.status==404) {
              vtt = null;
            }
          }
        });
        if (vtt) {
          parser.oncue = function(cue) {
            cues.push(cue);
          };
          parser.parse(vtt);
          parser.flush();
        }
        return cues;
      }

      function parseMediaFragmentHash(url) {
        var hash = url.substring(url.indexOf('#')+1);
        return hash.split('=')[1].split(',');
      }

      function setThumbnailImage(url) {
        // Make sure the url is protocol/scheme relative
        var protocol_relative_url = url.substr(url.indexOf('://')+1);
        $('.mejs-plugin-time-float-thumbnail').css('background-image','url("' + protocol_relative_url.split('#')[0] + '")');
      }

      var
        mediaContainer = player.container.find('.mejs-mediaelement').parent(),
        element_to_observe = player.container.find('.mejs-time-float-current')[0],
        video_thumbnail_vtt_url,
        cues,
        preview_thumbnails_track = mediaContainer.find("track[kind='metadata'].time-rail-thumbnails"),
        time_rail_thumbnails_seconds;

      if (player.options.timeRailThumbnailsSeconds) {
        time_rail_thumbnails_seconds = player.options.timeRailThumbnailsSeconds;
      } else {
        time_rail_thumbnails_seconds = 5;
      }

      if (preview_thumbnails_track.length > 0) {
        video_thumbnail_vtt_url = preview_thumbnails_track.attr('src');
      } else {
        return;
      }
      cues = getVttCues(video_thumbnail_vtt_url);

      // If there is only one cue then there's no need to show thumbnails at all so don't do anything.
      if (cues.length > 1) {
        // Set up the container to hold the thumbnail.
        var time_float = mediaContainer.find('.mejs-time-float');
        time_float.prepend('<span class="mejs-plugin-time-float-thumbnail"></span>');

        // Set necessary styles.
        var xywh = parseMediaFragmentHash(cues[0].text);
        var x = xywh[0];
        var y = xywh[1];
        var w = xywh[2];
        var h = xywh[3];
        var new_height = parseInt(h) + time_float.height();
        time_float.css('top', '-' + new_height + 'px');
        time_float.find('.mejs-time-float-corner').css('top', new_height - 3 + 'px');
        time_float.css('height', 'auto');
        time_float.css('width', w + 'px');
        time_float.find('.mejs-time-float-current').css('position', 'static');
        time_float.find('.mejs-plugin-time-float-thumbnail').css('position', 'static');

        time_float.css('-webkit-border-radius', '0').css('border-radius', '0');
        time_float.find('span').css('-webkit-border-radius', '0').css('border-radius', '0');

        setThumbnailImage(cues[0].text);

        // Add an observer to the .mejs-time-float-current and change the thumbnail
        // when the observer is triggered
        var observer = new MutationObserver(function(mutations){
          var time_code_current = $('.mejs-time-float-current').text();

          var sections = time_code_current.split(':');
          if (sections.length < 3) {
            time_code_current = "00:" + time_code_current;
          }

          // If the mouse is hovering over the 0 seconds mark, then show the first frame.
          // Otherwise show something deeper into the video.
          var seconds = mejs.Utility.timeCodeToSeconds(time_code_current),
            cue;
          if (seconds == 0) {
            cue = cues[0];
          } else {
            var tile = Math.floor(seconds / time_rail_thumbnails_seconds);
            cue = cues[tile + 1];
          }

          // The text of the cue will be the background image of the thumbnail container.
          setThumbnailImage(cue.text);

          // Use the spatial media fragment hash of the url to determine the coordinates and size
          // of the image to be displayed.
          var xywh = parseMediaFragmentHash(cue.text);
          var x = xywh[0];
          var y = xywh[1];
          var w = xywh[2];
          var h = xywh[3];

          // Set the background position and height and width.
          $('.mejs-plugin-time-float-thumbnail').css('background-position', '-' + x + 'px -' + y + 'px' );
          $('.mejs-plugin-time-float-thumbnail').css('height', h);
          $('.mejs-plugin-time-float-thumbnail').css('width', w);

        });

        observer.observe(element_to_observe, {attributes: true, childList: true, characterData: true, subtree:true});
      }
    }
  });
})(mejs.$);
