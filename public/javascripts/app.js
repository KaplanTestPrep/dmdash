import "./modules/zoom";
import "./modules/brightcove";

import $ from 'jquery';
window.jQuery = $;
window.$ = $;
/*  OR webpack
new webpack.ProvidePlugin({
  $: 'jquery',
  jQuery: 'jquery'
})
*/


$(document).ready(function () {

  $('#datepicker').datetimepicker({
    format: 'YYYY-MM-DD'
  });

  $('.selectpicker').selectpicker({
    style: 'btn-default',
    size: 8
  });
  
});
