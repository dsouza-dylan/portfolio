import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
const projects = await fetchJSON(`../lib/projects.json`);
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;
renderProjects(projects, projectsContainer, 'h2');

let svg = d3.select('svg');
let legend = d3.select('.legend');
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let arc = arcGenerator({
//   startAngle: 0,
//   endAngle: 2 * Math.PI,
// });

// let rolledData = d3.rollups(
//   projects,
//   (v) => v.length,
//   (d) => d.year,
// );

// let data = rolledData.map(([year, count]) => {
//   return { value: count, label: year };
// });

// let sliceGenerator = d3.pie().value((d) => d.value);
// let arcData = sliceGenerator(data);
// let arcs = arcData.map((d) => arcGenerator(d));
// arcs.forEach((arc, idx) => {
//     d3.select('svg')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
// })


// let query = '';
// searchInput.addEventListener('change', (event) => {
//   // update query value
//   query = event.target.value;
//   // filter projects
//   let filteredProjects = projects.filter((project) => {
//     let values = Object.values(project).join('\n').toLowerCase();
//     return values.includes(query.toLowerCase());
//   });
//   // render filtered projects
//   renderProjects(filteredProjects, projectsContainer, 'h2');
// });

// Refactor all plotting into one function
let selectedIndex = -1;
let searchQuery = '';
let searchInput = document.querySelector('.searchBar');
function renderPieChart() {
  // re-calculate rolled data
  svg.selectAll('*').remove();
  legend.selectAll('*').remove();

  let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  renderPieChart.selectedData = data;

  // re-calculate slice generator, arc data, arc, etc.
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let arcs = arcData.map((d) => arcGenerator(d));

  svg.selectAll('path').remove();

  arcs.forEach((arc, idx) => {
      svg
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
        .on('click', () => {
          selectedIndex = selectedIndex === idx ? -1 : idx;
          updateProjects();
          renderPieChart();
      });
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
  });
}

function getFilteredProjects() {
  if (!renderPieChart.selectedData) return projects;
  return projects.filter(p => {
    let matchesSearch = Object.values(p).join('\n').toLowerCase().includes(searchQuery);
    let matchesYear = selectedIndex === -1 || p.year === renderPieChart.selectedData[selectedIndex].label;
    return matchesSearch && matchesYear;
  });
}

function updateProjects() {
  let filteredProjects = getFilteredProjects();
  renderProjects(filteredProjects, projectsContainer, 'h2');
}

searchInput.addEventListener('input', (event) => {
  searchQuery = event.target.value.toLowerCase();
  updateProjects();
  renderPieChart();
});

renderPieChart();
updateProjects();