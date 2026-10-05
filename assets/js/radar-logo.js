/**
 * Componente de UI: Radar SVG Logo
 * Radar Relevantia · /js/radar-svg-logo.js
 *
 * Encapsula o SVG animado da marca Radar Relevantia em um módulo leve e reutilizável.
 * Elimina repetições monolíticas de 50+ linhas de SVG inline no HTML.
 */

(function (window) {
  'use strict';

  var RadarSVG = {
    /**
     * Retorna a string do SVG animado do Radar com opções configuráveis
     * @param {Object} opts - { width: number|string, height: number|string, idSuffix: string }
     */
    getLogoHTML: function (opts) {
      opts = opts || {};
      var w = opts.width || 52;
      var h = opts.height || 52;
      var suffix = opts.idSuffix || Math.random().toString(36).substring(2, 7);

      var baseId = 'sb-base-' + suffix;
      var swGId = 'sb-swG-' + suffix;
      var clipId = 'sb-dc-' + suffix;
      var dot1Id = 'sb-dot1-' + suffix;
      var dot2Id = 'sb-dot2-' + suffix;
      var dot3Id = 'sb-dot3-' + suffix;

      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg" style="display:block;">' +
        '<defs>' +
          '<radialGradient id="' + baseId + '" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#6b5a14"/>' +
            '<stop offset="20%" stop-color="#504510"/>' +
            '<stop offset="40%" stop-color="#3a340c"/>' +
            '<stop offset="60%" stop-color="#282208"/>' +
            '<stop offset="80%" stop-color="#181404"/>' +
            '<stop offset="100%" stop-color="#0a0802"/>' +
          '</radialGradient>' +
          '<linearGradient id="' + swGId + '" x1="0.5" y1="0" x2="0" y2="0.5">' +
            '<stop offset="0%" stop-color="#c8a428" stop-opacity="0.28"/>' +
            '<stop offset="100%" stop-color="#c8a428" stop-opacity="0"/>' +
          '</linearGradient>' +
          '<clipPath id="' + clipId + '"><circle cx="140" cy="140" r="118"/></clipPath>' +
        '</defs>' +
        '<circle cx="140" cy="140" r="121" fill="#060502"/>' +
        '<circle cx="140" cy="140" r="118" fill="url(#' + baseId + ')"/>' +
        '<g clip-path="url(#' + clipId + ')">' +
          '<circle cx="140" cy="140" r="116" fill="none" stroke="#9a8828" stroke-width="0.5" opacity="0.55"/>' +
          '<circle cx="140" cy="140" r="100" fill="none" stroke="#9a8828" stroke-width="0.45" opacity="0.50"/>' +
          '<circle cx="140" cy="140" r="80" fill="none" stroke="#9a8828" stroke-width="0.45" opacity="0.50"/>' +
          '<circle cx="140" cy="140" r="60" fill="none" stroke="#9a8828" stroke-width="0.45" opacity="0.52"/>' +
          '<circle cx="140" cy="140" r="40" fill="none" stroke="#9a8828" stroke-width="0.45" opacity="0.55"/>' +
          '<circle cx="140" cy="140" r="20" fill="none" stroke="#9a8828" stroke-width="0.45" opacity="0.60"/>' +
        '</g>' +
        '<circle cx="140" cy="140" r="118" fill="none" stroke="#b89824" stroke-width="1.6" opacity="0.65"/>' +
        '<circle cx="140" cy="140" r="103" fill="none" stroke="#b89824" stroke-width="1.1" opacity="0.55"/>' +
        '<circle cx="140" cy="140" r="80" fill="none" stroke="#b89824" stroke-width="1.1" opacity="0.50"/>' +
        '<circle cx="140" cy="140" r="52" fill="none" stroke="#b89824" stroke-width="1.1" opacity="0.45"/>' +
        '<circle cx="140" cy="140" r="26" fill="none" stroke="#b89824" stroke-width="1.1" opacity="0.42"/>' +
        '<line x1="140" y1="22" x2="140" y2="258" stroke="#b89824" stroke-width="0.8" opacity="0.55"/>' +
        '<line x1="22" y1="140" x2="258" y2="140" stroke="#b89824" stroke-width="0.8" opacity="0.55"/>' +
        '<g clip-path="url(#' + clipId + ')">' +
          '<g style="transform-origin:140px 140px;animation:sb-sweep 5s linear infinite">' +
            '<path d="M140 140 L140 22 A118 118 0 0 1 223.5 53.5 Z" fill="url(#' + swGId + ')"/>' +
            '<path d="M140 140 L190 28 A118 118 0 0 0 140 22 Z" fill="#c8a428" opacity="0.16"/>' +
            '<line x1="140" y1="140" x2="140" y2="22" stroke="#c8a428" stroke-width="1.8" opacity="0.7"/>' +
          '</g>' +
        '</g>' +
        '<circle cx="140" cy="140" r="3" fill="#1a1608" stroke="#b89824" stroke-width="0.6" opacity="0.7"/>' +
        '<circle cx="190" cy="72" r="5" fill="#d8c890" style="animation:sb-dot1 5s linear infinite"/>' +
        '<circle cx="82" cy="170" r="5" fill="#d8c890" style="animation:sb-dot2 5s linear infinite"/>' +
        '<circle cx="222" cy="195" r="5" fill="#d8c890" style="animation:sb-dot3 5s linear infinite"/>' +
      '</svg>';
    },

    /**
     * Monta o logo em todos os elementos com a classe .radar-logo-mount
     */
    init: function () {
      var mounts = document.querySelectorAll('.radar-logo-mount');
      for (var i = 0; i < mounts.length; i++) {
        var el = mounts[i];
        if (el.getAttribute('data-mounted') === 'true') continue;
        var w = el.getAttribute('data-width') || 52;
        var h = el.getAttribute('data-height') || 52;
        el.innerHTML = this.getLogoHTML({ width: w, height: h });
        el.setAttribute('data-mounted', 'true');
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { RadarSVG.init(); });
  } else {
    RadarSVG.init();
  }

  window.RadarSVG = RadarSVG;
})(window);
