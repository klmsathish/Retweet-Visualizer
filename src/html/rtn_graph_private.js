<script>

var colorselector = document.getElementById("nodecolor");
var nodescaling = 0.05;
var nodecolor = colorselector.options[colorselector.selectedIndex].value;

const elem = document.getElementById('graph');
const Graph = ForceGraph()(elem)
.graphData({nodes: data.nodes, links: data.links})
.nodeId('name')
//.nodeLabel(node => node.name)
.nodeColor(node => "black")
.nodeVal(node => node.in_degree * nodescaling)
.linkDirectionalParticleColor(() => 'red')
.linkHoverPrecision(10)
.onNodeRightClick(node => { Graph.centerAt(node.x, node.y, 1000);Graph.zoom(8, 2000);})
Graph.onLinkClick(Graph.emitParticle); // emit particles on link click

// Show label only for nodes with followers > 5000:
Graph.nodeLabel(node => {
  if (node.followers > 5000) {
        return node.name;}})

// Get the list of all users with followers > 5000 for autocomplete:
var users = []
for(var i in data.nodes)
    if (data.nodes[i].followers > 5000){
    users.push(data.nodes[i].name)};


// DRAW TWEETS IN DATASET
function drawtweets (){
    var bodyelement = document.querySelector('body')
    var bodystyle = window.getComputedStyle(bodyelement)
    var bg = bodystyle.getPropertyValue('color')
    if (bg === 'rgb(0, 0, 0)') {var themecol = 'light'}
    if (bg === 'rgb(255, 255, 255)') {var themecol = 'dark'} 
    var name = document.getElementById("searchuser").value
    document.getElementById("usertweets").innerHTML = "";
    const getNode = id => {
    return data.nodes.find(node => node.name === name);
    };
    var node = getNode(name)
    highlight(node)
    var tweets = node.tweets
    for (tweet of tweets) {
        twttr.widgets.createTweet(
          tweet,
          document.getElementById('usertweets'),
          {
            theme: themecol,
            dnt: true,
            width: 280
          }
        );        
    }
$("#content04").slideDown(300);
$("#content05").slideUp(300)
;  
}

// DRAW TWITTER TIMELINE
function drawtimeline(){
var bodyelement = document.querySelector('body')
var bodystyle = window.getComputedStyle(bodyelement)
var bg = bodystyle.getPropertyValue('color')
if (bg === 'rgb(0, 0, 0)') {var themecol = 'light'}
if (bg === 'rgb(255, 255, 255)') {var themecol = 'dark'} 
       
var name = document.getElementById("searchuser").value
document.getElementById("twitter_timeline").innerHTML = "";
twttr.widgets.createTimeline(
{
sourceType: "profile",
screenName: name
},
document.getElementById("twitter_timeline"),
{
theme: themecol,
height: 400,
chrome: 'noscrollbar',
dnt: true                    
});
{
$("#content05").slideDown(300);
$("#content04").slideUp(300)
};                  
}

// USER INFO ON CLICK
Graph.onNodeClick((node =>  {
    if (node.followers > 5000) {
userinfostring = `<ul> 
<li> Followers: ${node.followers}
<li> Followed accounts: ${node.friends}
<li> Times the user retweeted: ${node.out_degree}
<li> Times the user got retweeted: ${node.in_degree}
</ul>`
document.getElementById('userinfostring').innerHTML = userinfostring;
pastenodeinfo(node);
$("#content03").slideDown(300)
$("#content01").slideUp(300)

highlight(node)

}}))

function highlight(node){
var neighbors = []
neighbors.push(node)

for (link of data.links) {
  if (link.source == node) {
    neighbors.push(link.target)
    link.colorthat = 1
  }
  else if (link.target == node){
    neighbors.push(link.source)
    link.colorthat = 1
  }
  else {link.colorthat=0}
}
for (node of data.nodes){
  if(neighbors.includes(node)){
    node.colorthat = 1
  }
  else node.colorthat = 0}
colorbar = ['#d3d3d3', 'red']
Graph.nodeColor(() => 'black') 
Graph.nodeColor(node => colorbar[node.colorthat])
// linkcolor depending on dark/lightmode
var bodyelement = document.querySelector('body')
var bodystyle = window.getComputedStyle(bodyelement)
var bg = bodystyle.getPropertyValue('color')
if (bg === 'rgb(0, 0, 0)') {var colorbar2 = ['rgba(0,0,0,0.05)', 'rgba(255,0,0,0.5)']}
if (bg === 'rgb(255, 255, 255)') {var colorbar2 = ['rgba(255,255,255,0.03)', 'rgba(255,0,0,0.5)']}
Graph.linkColor(link => colorbar2[link.colorthat])
}
Graph.linkDirectionalParticles(link => {
  if (link.colorthat == 1) {
    return 1}
    else {
      return 0
    }})

Graph.onBackgroundClick(() => resetcolors())

function resetcolors(){
var bodyelement = document.querySelector('body')
var bodystyle = window.getComputedStyle(bodyelement)
var bg = bodystyle.getPropertyValue('color')
if (bg === 'rgb(0, 0, 0)') {
  var linkcol = 'rgba(0,0,0,0.2)'}
if (bg === 'rgb(255, 255, 255)') {
  var linkcol = 'rgba(255,255,255,0.2)'}

recolornodes()
Graph.linkColor(() => linkcol)}


var input = document.getElementById("searchuser");
new Awesomplete(input, {
list: users
});

// ZOOM ON USER
function zoomonuser(){
var name = document.getElementById("searchuser").value;
const getNode = id => {
return data.nodes.find(node => node.name === name);
}
var nodeathand = getNode(name)
Graph.centerAt(nodeathand.x, nodeathand.y, 1000);Graph.zoom(8, 2000);
console.log(nodeathand);}

// FLASH COLOR
function flashcolor(){
var bodyelement = document.querySelector('body')
var bodystyle = window.getComputedStyle(bodyelement)
var bg = bodystyle.getPropertyValue('color')
if (bg === 'rgb(0, 0, 0)') {var nodecol = 'black'}
if (bg === 'rgb(255, 255, 255)') {var nodecol = 'white'}
var name = document.getElementById("searchuser").value;
const getNode = id => {
return data.nodes.find(node => node.name === name);
};
var nodeathand = getNode(name)
console.log(nodeathand)
originalcolor = nodeathand.color
Graph.nodeColor(node => {
if (node.name === name) {
return "red";
}
else {return nodecol}
});
setTimeout(function(){            
Graph.nodeColor(node => {
if (node.name === name) {
return nodecol;
}
else {return nodecol}
});
}, 250);}

function resetzoom(){
Graph.centerAt(0, 0,1000);Graph.zoom(0.4, 1000)
}

// LIGHT / DARK MODE
var checkbox = document.querySelector('input[name=mode]');      
checkbox.addEventListener('change', function() {
if(this.checked) {
trans()
document.documentElement.setAttribute('data-theme', 'darktheme');
Graph.linkColor(() => 'rgba(255,255,255,0.2)');
var colorselector = document.getElementById("nodecolor");
var selectedoption = colorselector.options[colorselector.selectedIndex].value               
if (selectedoption === "none") {Graph.nodeColor(() => 'white')}
} 
else {
trans()
document.documentElement.setAttribute('data-theme', 'lighttheme');
Graph.linkColor(() => 'rgba(0,0,0,0.2)');
var colorselector = document.getElementById("nodecolor");
var selectedoption = colorselector.options[colorselector.selectedIndex].value                               
if (selectedoption === "none") {Graph.nodeColor(() => 'black')}
}
})
let trans = () => {
document.documentElement.classList.add('transition');
window.setTimeout(() => {
document.documentElement.classList.remove('transition');
}, 1000)
}

// RECOLOR NODES
var colorscale = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']
document.getElementById("nodecolor").addEventListener("change", recolornodes);

function recolornodes(){
var colorselector = document.getElementById("nodecolor");
var selectedoption = colorselector.options[colorselector.selectedIndex].value
if (selectedoption != "none"){
Graph.nodeColor(node => colorscale[node[selectedoption]])}            
else { 
var bodyelement = document.querySelector('body')
var bodystyle = window.getComputedStyle(bodyelement)
var bg = bodystyle.getPropertyValue('color')
if (bg === 'rgb(0, 0, 0)') {var nodecol = 'black'}
if (bg === 'rgb(255, 255, 255)') {var nodecol = 'white'}
Graph.nodeColor(node => nodecol)} }

// NODE SIZE
document.getElementById("slido").addEventListener("change", rescalenodes);
function rescalenodes(){
  var nodescaleslider = document.getElementById("slido");
  var newscale = nodescaleslider.value  
  var sizeselector = document.getElementById("nodesize");
  var selectedoption = sizeselector.options[sizeselector.selectedIndex].value
  if      (selectedoption === "followers"){Graph.nodeVal(node => node[selectedoption] * 0.000005 * newscale)}            
  else if (selectedoption === "friends"){Graph.nodeVal(node => node[selectedoption] * 0.001 * newscale)}
  else if (selectedoption === "out_degree"){Graph.nodeVal(node => node[selectedoption] * 0.1 * newscale)}
  else if (selectedoption === "in_degree"){Graph.nodeVal(node => node[selectedoption] * 0.1 * newscale)}              
}

document.getElementById("nodesize").addEventListener("change", changenodesize);
function changenodesize(){
var sizeselector = document.getElementById("nodesize");
var selectedoption = sizeselector.options[sizeselector.selectedIndex].value
if      (selectedoption === "followers"){Graph.nodeVal(node => node[selectedoption] * 0.00005)}            
else if (selectedoption === "friends"){Graph.nodeVal(node => node[selectedoption] * 0.001)}
else if (selectedoption === "out_degree"){Graph.nodeVal(node => node[selectedoption] * 1.0)}
else if (selectedoption === "in_degree"){Graph.nodeVal(node => node[selectedoption] * 1.0)}              
else { Graph.nodeVal(node => 1.0)} 
}

// NODE INFO ON HOVER
function pastenodeinfo(node){
userinfostring = `<ul> 
<li> Followers: ${node.followers}
<li> Followed accounts: ${node.friends}
<li> Times the user retweeted: ${node.out_degree}
<li> Times the user got retweeted: ${node.in_degree}
</ul>`
document.getElementById('userinfostring').innerHTML = userinfostring
document.getElementById("searchuser").value = node.name
if ($('#usertweets').is(':visible')){drawtweets()}
if ($('#twitter_timeline').is(':visible')){drawtimeline()} 
}


$(function() {
var colval="none"; 
$("#nodecolor").val(colval);
});
$(function() {
var sizeval="in_degree"; 
$("#nodesize").val(sizeval);
});


// INCLUDE NETWORK INFORMATION FROM GRAPH DATA
var netinfo = `<ul> 
<li> Keyword: ${data.graph.keyword}</li>
<li> Collected on: ${data.graph.collected_on}</li>
<li> First retweet: ${data.graph.first_tweet}</li>
<li> Last retweet: ${data.graph.last_tweet}</li>
</ul>`
var netmeasures = `
<ul>
  <li>Nodes: ${data.graph.N_nodes}</li>
  <li>Links: ${data.graph.N_links}</li>
</ul>`
document.getElementById('panel00').innerHTML = data.graph.type
document.getElementById('content00').innerHTML = netinfo
document.getElementById('content02').innerHTML = netmeasures

$("#content00").slideToggle(300)

</script>

</body>