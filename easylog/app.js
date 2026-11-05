document.querySelectorAll('.filter button').forEach(function(b){b.addEventListener('click',function(){
var f=b.dataset.f;document.querySelectorAll('.filter button').forEach(function(x){x.classList.toggle('on',x===b)});
document.querySelectorAll('.vl li').forEach(function(l){l.hidden=!(f==='all'||l.dataset.g===f)})})});
