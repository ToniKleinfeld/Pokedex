const BASE_URL = "https://pokeapi.co/api/v2/";
let pokemonData = [];
let countloadedPokemon = 0;
let current_path_loaded = "pokemon?limit=25&offset=0";
let big_cardOn = false
let color = {
  'normal': "grey",
  'fire': "red",
  'water': "blue",
  'electric': "yellow",
  'grass' : "green" ,
  'ice' : "lightblue" ,
  'fighting' : "orange" ,
  'poison' : "purple" ,
  'ground' : "brown" ,
  'flying' : "skyblue" ,
  'psychic' : "pink" ,
  'bug' : "greenyellow" ,
  'rock' : "darkred" ,
  'ghost' : "darkorchid" ,
  'dragon' : "darkblue" ,
  'dark' : "#454545",
  'steel' : "silver",
  'fairy' : "lightcoral",
};

function init() {  
  pokemonLoadfunc();
}

async function pokemonLoadfunc() {
  loadingSpinner()

  await loadPokemonUrlList();
  await singlePokemonData();
  await getSpeciesInfoData();

  renderPokecards();
}

async function loadPokemonUrlList(){
  let userResponse = await getPokemonData(current_path_loaded);
  current_path_loaded = userResponse.next.slice(26); // Cut and push current URL for Current_path_loaded for next 25x Pokemon

  userResponse["results"].forEach((results) => {
    //push Pokemon as Objekt to Array
    pokemonData.push({ name: results.name , url : results.url.slice(26)});    
  });
}

async function singlePokemonData(){
  for (let index = countloadedPokemon; index < pokemonData.length; index++) {
  const pokeArrayIndex = pokemonData[index];
  countloadedPokemon++;
  let pokemonDataBase = await getPokemonData(pokeArrayIndex['url']);

  getPokemonStatsAndPic(pokeArrayIndex,pokemonDataBase);
  getPokemonTypes(pokeArrayIndex,pokemonDataBase);    
  getPokemonMovesAndAbilitys(pokeArrayIndex,pokemonDataBase);
}
}

async function getPokemonData(path) {
  try {
    let response = await fetch(BASE_URL + path );
    return (responseAsJson = await response.json());
   } catch(error){
    console.error("Fehler beim Laden der Pokemondaten");
   }

}

function getPokemonStatsAndPic(pokeArrayIndex,pokemonDataBase){
  pokeArrayIndex.speciesurl = pokemonDataBase.species.url.slice(26);
  pokeArrayIndex.img = pokemonDataBase.sprites.other.dream_world.front_default;
  pokeArrayIndex.id = pokemonDataBase.id;
  pokeArrayIndex.stats = ({hp: pokemonDataBase.stats[0].base_stat});
  pokeArrayIndex.stats.attack = pokemonDataBase.stats[1].base_stat;
  pokeArrayIndex.stats.defense = pokemonDataBase.stats[2].base_stat;
  pokeArrayIndex.stats.s_attack = pokemonDataBase.stats[3].base_stat;
  pokeArrayIndex.stats.s_defense = pokemonDataBase.stats[4].base_stat;
  pokeArrayIndex.stats.speed = pokemonDataBase.stats[5].base_stat;
  pokeArrayIndex.weight = pokemonDataBase.weight;
  pokeArrayIndex.height = pokemonDataBase.height;
}

function getPokemonTypes(pokeArrayIndex,pokemonDataBase) {
   let poketyp1 = pokemonDataBase.types[0].type.name; 

    pokeArrayIndex.typ1 = poketyp1;  
    if (pokemonDataBase.types.length == 2) {      
      pokeArrayIndex.typ2 = pokemonDataBase.types[1].type.name;       
    } else {
      pokeArrayIndex.typ2 = '';
    }
}

function getPokemonMovesAndAbilitys(pokeArrayIndex,pokemonDataBase) {
  pokeArrayIndex.moves = [pokemonDataBase.moves[0].move.name];

  for (let index = 1; index < pokemonDataBase.moves.length; index++) {
   pokeArrayIndex['moves'].push(pokemonDataBase['moves'][index]['move']['name']);
   }

   pokeArrayIndex.abilities = ({0: pokemonDataBase.abilities[0].ability.name}); 
   for (let index = 1; index < pokemonDataBase.abilities.length; index++) {
     pokeArrayIndex['abilities'][index] = pokemonDataBase['abilities'][index]['ability']['name'];
     }
}

async function getSpeciesInfoData(){
  for (let index = countloadedPokemon-25; index < pokemonData.length; index++) {
    const pokeArrayIndex = pokemonData[index];
    let pokemonDataBase = await getPokemonData(pokeArrayIndex['speciesurl']); 
        
    if (pokemonDataBase.evolution_chain !== null) {
      pokeArrayIndex.evolution_chain = pokemonDataBase.evolution_chain.url.slice(26);
      pokeArrayIndex.flavor_text = pokemonDataBase.flavor_text_entries[2].flavor_text;
      pokeArrayIndex.genera = pokemonDataBase.genera[7].genus;
      pokeArrayIndex.habitat = pokemonDataBase.habitat.name;
    } 
  }
}

function renderPokecards() {
    for (let index = countloadedPokemon-25; index < pokemonData.length; index++) {
    const pokemonInfo = pokemonData[index];

    document.getElementById("content").innerHTML += pokeCardHtml(pokemonInfo, index);
    if (pokemonInfo['typ2'] !== "") {
      document.getElementById(`typ${index}`).innerHTML += pokeCardtyp2Html(pokemonInfo)
    }
  }
  loadingSpinner();
}

function loadBigPokecard(index){
  bigCardOnOrOFF()

  let pokemon=pokemonData[index]; 

  document.getElementById('bigpokemoncard').innerHTML = ''
  document.getElementById('bigpokemoncard').innerHTML = bigPokemonCardhtml(pokemon,index);
  addAbilitys(pokemon,index);
  addMoves(pokemon,index);
}

function addAbilitys(pokemon,index){
  document.getElementById(`abilitys${index}`).innerHTML += abilitysHtml(pokemon.abilities['0']); 
  if (pokemon.abilities['1'] !== undefined) {
    document.getElementById(`abilitys${index}`).innerHTML += abilitysHtml(pokemon.abilities['1']); 
  }
  if (pokemon.abilities['2'] !== undefined) {
    document.getElementById(`abilitys${index}`).innerHTML += abilitysHtml(pokemon.abilities['2']); 
  } 
}

function addMoves(pokemon,index){  
  for (let i = 0; i < pokemon.moves.length; i++) {
    const move = pokemon.moves[i];
    document.getElementById(`moves${index}`).innerHTML += movesHtml(move)
  }
}

function bigCardOnOrOFF(close){
  if (big_cardOn == false) {
    big_cardOn = true;
    document.getElementById('big_card').classList.toggle('d-none');
    document.getElementById('body').classList.toggle('noscroll');
  } else if(close == true){
    big_cardOn = false;
    document.getElementById('big_card').classList.toggle('d-none');
    document.getElementById('body').classList.toggle('noscroll');
  }
}

function doNotClose(event) {
  event.stopPropagation();            //verhindert das schließen des fensters im event bereich! 
}

function showBasicInfo() {
  document.getElementById('basicInfoContainer').classList.remove('d-none');
  document.getElementById('abilitiesContainer').classList.add('d-none');
  document.getElementById('basicStatsContainer').classList.add('d-none');

  document.getElementById('basicinfo').classList.add('aktive');  
  document.getElementById('basicstats').classList.remove('aktive');
  document.getElementById('abilitys').classList.remove('aktive');
}

function showBasicStats(){
  document.getElementById('basicInfoContainer').classList.add('d-none');
  document.getElementById('abilitiesContainer').classList.add('d-none');
  document.getElementById('basicStatsContainer').classList.remove('d-none');

  document.getElementById('basicinfo').classList.remove('aktive');  
  document.getElementById('basicstats').classList.add('aktive');
  document.getElementById('abilitys').classList.remove('aktive');
}

function showAbilitys() {
  document.getElementById('basicInfoContainer').classList.add('d-none');
  document.getElementById('abilitiesContainer').classList.remove('d-none');
  document.getElementById('basicStatsContainer').classList.add('d-none');

  document.getElementById('basicinfo').classList.remove('aktive');  
  document.getElementById('basicstats').classList.remove('aktive');
  document.getElementById('abilitys').classList.add('aktive');
}

function loadNextPokemon(index){
  if (pokemonData.length == index+1) {
    loadBigPokecard(0);
  } else {
    index++
    loadBigPokecard(index);
  }
}

function loadPrevievPokemon(index){
  if (index == 0) {
    loadBigPokecard(pokemonData.length-1);
  } else {
    index--
    loadBigPokecard(index);
  }
}

function filterPokemon(){
  let search = document.getElementById("search").value.toLowerCase();  

  let list = document.getElementById("list");
if (search.length >= 3) {
  list.innerHTML = "";

  for (let index = 0; index < pokemonData.length; index++) {
    const pokeName = pokemonData[index].name;

    if(pokeName.toLowerCase().includes(search)) 
    list.innerHTML += `<li><a href="#pokemon${index}">${pokeName}</a></li>`;
    }
  }
}

function showSearchResults() {
  setTimeout(() => {
    document.getElementById('list').classList.toggle('d-none');
  }, 500);    //timeout to be able to click the Pokemon , when focus on searchbar lost, to close list
}

function loadingSpinner(){
  document.getElementById('loadinbutton').classList.toggle('d-none');
  document.getElementById('loadingspinner').classList.toggle('d-none');
}

function pokeCardHtml(pokemon,index) {
  return /*html*/ `
     <div class="pokecard centercontainer column"  onclick="loadBigPokecard(${index})">
        <div class="pokeimg centercontainer"  style="background-color:${color[pokemon.typ1]}; background:linear-gradient(to right,${color[pokemon.typ1]},${color[pokemon.typ2]})">
          <img src="${pokemon['img']}" alt="Pokemon" id="pokemon${index}">
        </div>
        <div class="pokename centercontainer column">
          <p><strong>Nr. ${pokemon['id']}</strong></p>
          <h2>${pokemon['name']}</h2>
        </div>
        <div id="typ${index}" class="type centercontainer">
          <div class="typ centercontainer"  style="background-color:${color[pokemon.typ1]}"><strong>${pokemon['typ1']}</strong></div>            
        </div>    
     </div>
    `;
}

function pokeCardtyp2Html(pokemon) {
  return /*html*/`
    <div class="typ centercontainer" style="background-color:${color[pokemon.typ2]}"><strong>${pokemon['typ2']}</strong></div>
  `
}

function bigPokemonCardhtml(pokemon,index){
  return /*html*/`
                <div class="centercontainer big_pic " style="background-color:${color[pokemon.typ1]}; background:linear-gradient(to right,${color[pokemon.typ1]},${color[pokemon.typ2]})"> 
                  <div class="arrow centercontainer" onclick="loadPrevievPokemon(${index})"> <img src="./assets/img/arrow.png" alt=""></div>
                <img src="${pokemon.img}" alt="Pokemon">
                  <div class="arrow right centercontainer"onclick="loadNextPokemon(${index})"><img src="./assets/img/arrow.png" alt=""></div>
                </div>
            <div class="pokenamebigcard">
                <div class="centercontainer bigmenuname"><strong>${pokemon.name}</strong></div>
                <div class="centercontainer infomenu">
                    <div onclick="showBasicInfo()" id="basicinfo" class="aktive"><span class="small_display">Basic</span> Infos</div>
                    <div onclick="showBasicStats()" id="basicstats"><span class="small_display">Basic</span> Stats</div>
                    <div onclick="showAbilitys()" id="abilitys">Abiltiys</div>
                </div>
            </div>
            <div class="centercontainer pokeinfocontainer">
                <div class="centercontainer basicInfo" id="basicInfoContainer"> 
                    <tbody>
                        <table>
                          <caption>${pokemon.flavor_text}</caption>
                           <tr>
                            <td>ID</td>
                            <td>${pokemon.id}</td>
                           </tr>
                           <tr>
                               <td>Monstertyp</td>
                               <td>${pokemon.genera}</td>
                            </tr>
                            <tr>
                                <td>Elementary types</td>
                                <td class="cap">${pokemon.typ1} <br>  ${pokemon.typ2}</td>
                            </tr>
                            <tr>
                             <td>Weight</td>
                             <td> ${pokemon.weight/10} kg</td>
                            </tr>
                            <tr>
                             <td>Height</td>
                             <td>${pokemon.height/10} m</td>
                            </tr>
                            <tr>
                             <td>Habitat</td>
                             <td class="cap">${pokemon.habitat}</td>
                            </tr>
                        </table>
                    </tbody>
                </div>
                <div class="centercontainer basicStats d-none" id="basicStatsContainer">
                    <tbody>
                        <table>
                            <tr>
                                <td>HP</td>
                                <td >
                                  <div class="borderstats">
                                    <div class="progressbar "style="width:${pokemon.stats.hp}%">${pokemon.stats.hp}</div>
                                  </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Attack</td>
                                <td>
                                <div class="borderstats">
                                <div class="progressbar "style="width: ${pokemon.stats.attack}%">${pokemon.stats.attack}</div></td>
                            </tr>
                            <tr>
                                <td>Defense</td>
                                <td>
                                <div class="borderstats">  
                                <div class="progressbar "style="width:${pokemon.stats.defense}%">${pokemon.stats.defense}</div>
                              </div>
                            </td>
                            </tr>
                            <tr>
                                <td>Spezialattack</td>
                                <td>
                                <div class="borderstats">
                                <div class="progressbar "style="width:${pokemon.stats.s_attack}%">${pokemon.stats.s_attack}</div>
                              </div>
                            </td>
                            </tr>
                            <tr>
                                <td>Spezialdefense</td>
                                <td>
                                <div class="borderstats">
                                <div class="progressbar "style="width:${pokemon.stats.s_defense}%">${pokemon.stats.s_defense}</div>
                              </div>
                            </td>
                            </tr>
                            <tr>
                                <td>Speed</td>
                                <td>
                                <div class="borderstats">
                                  <div class="progressbar "style="width:${pokemon.stats.speed}%">${pokemon.stats.speed}</div>
                                </div>
                                </td>
                            </tr>
                        </table>
                    </tbody>
                </div>
                <div class="centercontainer abilitysandmoves column d-none" id="abilitiesContainer"> 
                    <div class="abilitys" >
                        <div>
                            <strong>Abilitys</strong>
                        </div>
                        <div class="centercontainer gap" id="abilitys${index}">                         
                        </div>
                    </div>
                    <div class="moves column">
                        <strong>Learnable Moves</strong>
                        <div class="movelist" id="moves${index}">                            
                        </div>
                    </div>
                    </div>
                </div>
            </div>
  `
}

function abilitysHtml(ability){
  return /*html*/`
    <div class="ability">${ability}</div>
  `
}

function movesHtml(move){
  return /*html*/`
    <div class="movedesign">${move}</div>
  `
}