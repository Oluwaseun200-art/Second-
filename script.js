const locations = {
  "main-gate": {name:"University Main Gate"},
  "kuti": {name:"Kuti Hall"},
  "tech": {name:"Faculty of Technology"},
  "uih": {name:"University Health Centre"},
  "sub": {name:"Students' Union Building"},
  "sports": {name:"Sports Centre"},
  "arts": {name:"Faculty of Arts"},
  "science": {name:"Faculty of Science"}
};

// Prototype network. Distances and times are illustrative and should be
// replaced with verified University of Ibadan transportation data.
const edges = [
  ["main-gate","kuti",1.8,6],["main-gate","arts",2.4,8],
  ["kuti","tech",1.6,5],["kuti","sub",1.2,4],
  ["arts","science",1.7,5],["arts","sub",1.9,6],
  ["tech","science",1.1,4],["tech","uih",2.0,7],
  ["sub","uih",1.5,5],["sub","sports",1.8,6],
  ["science","uih",1.4,5],["uih","sports",1.0,3]
];

const origin = document.getElementById("origin");
const destination = document.getElementById("destination");
const form = document.getElementById("routeForm");
const result = document.getElementById("result");
const message = document.getElementById("message");

Object.entries(locations).forEach(([id, loc]) => {
  origin.add(new Option(loc.name, id));
  destination.add(new Option(loc.name, id));
});

function buildGraph() {
  const graph = {};
  Object.keys(locations).forEach(id => graph[id] = []);
  edges.forEach(([a,b,d,t]) => {
    graph[a].push({to:b, distance:d, time:t});
    graph[b].push({to:a, distance:d, time:t});
  });
  return graph;
}

function dijkstra(start, end) {
  const graph = buildGraph();
  const dist = {}, prev = {}, visited = new Set();
  Object.keys(graph).forEach(id => { dist[id] = Infinity; prev[id] = null; });
  dist[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    let current = null;
    for (const id of Object.keys(graph)) {
      if (!visited.has(id) && (current === null || dist[id] < dist[current])) current = id;
    }
    if (current === null || dist[current] === Infinity) break;
    visited.add(current);
    if (current === end) break;

    for (const edge of graph[current]) {
      const next = dist[current] + edge.distance;
      if (next < dist[edge.to]) {
        dist[edge.to] = next;
        prev[edge.to] = current;
      }
    }
  }

  if (dist[end] === Infinity) return null;

  const path = [];
  let cur = end;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }

  let time = 0;
  for (let i=0;i<path.length-1;i++) {
    const a = path[i], b = path[i+1];
    const e = graph[a].find(x => x.to === b);
    time += e.time;
  }
  return {path, distance:dist[end], time};
}

form.addEventListener("submit", e => {
  e.preventDefault();
  message.textContent = "";
  result.classList.add("hidden");

  if (!origin.value || !destination.value) {
    message.textContent = "Please select both an origin and a destination.";
    return;
  }
  if (origin.value === destination.value) {
    message.textContent = "Origin and destination must be different.";
    return;
  }

  const route = dijkstra(origin.value, destination.value);
  if (!route) {
    message.textContent = "No route is available between the selected locations.";
    return;
  }

  const stops = route.path.map((id, i) =>
    `<div class="stop"><strong>${i+1}.</strong> ${locations[id].name}</div>`
  ).join("");

  result.innerHTML = `
    <h3>Recommended Route</h3>
    <p>From <strong>${locations[origin.value].name}</strong> to <strong>${locations[destination.value].name}</strong></p>
    <div class="route-list">${stops}</div>
    <div class="metrics">
      <div class="metric"><strong>Distance</strong><br>${route.distance.toFixed(1)} km</div>
      <div class="metric"><strong>Estimated time</strong><br>${route.time} minutes</div>
      <div class="metric"><strong>Routing method</strong><br>Dijkstra shortest path</div>
    </div>`;
  result.classList.remove("hidden");
});

document.getElementById("menuBtn").addEventListener("click", () =>
  document.getElementById("navLinks").classList.toggle("open")
);
