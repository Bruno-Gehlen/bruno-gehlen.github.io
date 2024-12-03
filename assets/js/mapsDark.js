function initMap() {
    // Coordenadas do IFUSP
    const ifuspCoords = { lat: -23.560114828231292, lng: -46.734681230749025 }; 

    // Estilo noturno do mapa
    const nightModeStyle = [
        { elementType: "geometry", stylers: [{ color: "#212121" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
        { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
        { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
    ];

    // Inicialização do mapa
    const map = new google.maps.Map(document.getElementById("map"), {
        center: ifuspCoords,
        zoom: 17,
        styles: nightModeStyle,
    });

    // Adicionar marcador
    const marker = new google.maps.Marker({
        position: ifuspCoords,
        map: map,
        title: "Instituto de Física da USP",
    });

    // Criar a InfoWindow 
    const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="max-width: 1500px; color: #000; text-align: left; overflow: hidden;">
                    <img src="https://portal.if.usp.br/imprensa/sites/portal.if.usp.br.ifusp/files/styles/media_gallery_large/public/DSC_0001a-22a.jpg?itok=97bVPIIU" 
                        //  alt="Instituto de Física da USP" 
                         style="width: 100%; height: 95px; object-fit: cover; object-position: 0% 26%; border-radius: 5px; margin-bottom: 10px;">
                    <h3 style="font-size: 18px; margin: 0;">Instituto de Física da USP</h3>
                    <p style="margin: 5px 0; font-size: 14px;">
                        <strong>Endereço:</strong> R. do Matão, 1371 - Cidade Universitária, São Paulo - SP, 05508-090
                    </p>
                    <a href="https://www.google.com/maps?q=Instituto+de+F%C3%ADsica+da+USP" 
                       target="_blank" 
                       style="color: #4caf50; text-decoration: none;">
                        Ver no Google Maps
                    </a>
                </div>
            `,
        });

    // Exibir InfoWindow ao clicar no marcador
    marker.addListener("click", () => {
        infoWindow.open(map, marker);
    });
}