(function(){
var today=new Date(Date.now()+324e5).toISOString().slice(0,10);
document.querySelectorAll('[data-until]').forEach(function(l){var u=l.dataset.until;if(u&&u<today)l.hidden=true});
var now=document.getElementById('now');
if(now&&!now.querySelector('li:not([hidden])'))now.hidden=true;
document.querySelectorAll('.filter button').forEach(function(b){b.addEventListener('click',function(){
var f=b.dataset.f;document.querySelectorAll('.filter button').forEach(function(x){x.classList.toggle('on',x===b)});
document.querySelectorAll('.vl li').forEach(function(l){l.hidden=!(f==='all'||l.dataset.g===f)})})});
var tabs=document.querySelectorAll('.tabs a'),panels=document.querySelectorAll('.panel');
function show(id,scroll){var ok=false;panels.forEach(function(p){if(p.id===id)ok=true});if(!ok)id='wedding';
panels.forEach(function(p){p.hidden=p.id!==id});tabs.forEach(function(t){t.classList.toggle('on',t.dataset.t===id)});
if(scroll)document.querySelector('.tabs').scrollIntoView()}
tabs.forEach(function(t){t.addEventListener('click',function(e){e.preventDefault();history.replaceState(null,'','#'+t.dataset.t);show(t.dataset.t,true)})});
show(location.hash.slice(1),false);
addEventListener('hashchange',function(){show(location.hash.slice(1),true)});
})();
