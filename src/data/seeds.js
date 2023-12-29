const { getLogger } = require("../core/logger.js");
const { PrismaClient } = require("@prisma/client");

// =========== functions =================
const seedData = async () => {
  // - Logger
  const logger = getLogger();

  logger.info(`🌱 Seeding data`);
  const prisma = new PrismaClient();

  try {
    await prisma.trainComponent.createMany({
      data: [
        {
          type: "LOCOMOTIVE",
          subtype: "Type 13",
          image:
            "https://yanidegrande.com/static/media/_3.b2bbfff2467bea9386df.jpeg",
          descriptionImage:
            "https://i0.wp.com/railsimbelgium.com/wp-content/uploads/2021/08/Schermopname-826.png?resize=1536%2C864&ssl=1",
          description:
            "De HLE 13 is een type elektrische locomotief dat sinds 1997 wordt ingezet door de NMBS en het transportbedrijf Lineas (vroegere NMBS Logistics). Deze reeks is gebouwd door Alstom en draagt de nummers 1301 - 1360. Deze reeks heeft een Luxemburgse zusterreeks die nagenoeg identiek is, namelijk de reeks CFL 3000. Momenteel rijdt reeks 13 in passagiersdienst nog slechts enkele ritten met I11- of M6-rijtuigen op de IC-16/34 Brussel-Luxemburg.",
        },
        {
          type: "LOCOMOTIVE",
          subtype: "Type 18",
          image:
            "https://yanidegrande.com/static/media/_8.5ddc575bdd894aa71f1a.jpeg",
          descriptionImage:
            "https://i0.wp.com/railsimbelgium.com/wp-content/uploads/2023/01/24010_20230501141051_1.png?resize=1536%2C864&ssl=1",
          description:
            "Reeks 18 en reeks 19 zijn elektrische locomotieven voor reizigersverkeer, in 2007 besteld door de NMBS. Er werden 120 machines gebouwd tussen 2009 en 2012. De machines komen uit de locomotieffamilie ES 2007, gebaseerd op het Taurus IV-platform en opgevolgd door de locomotieffamilie Vectron. Deze locomotief bevat onder andere de beveiligingssystemen KVB, ETCS, TBL1, MEMOR-RS, VA (Dodeman), enzovoort.",
        },
        {
          type: "LOCOMOTIVE",
          subtype: "Type 77",
          image:
            "https://yanidegrande.com/static/media/hlr77_1.0b5d5399468249e6d7c2.jpeg",
          descriptionImage:
            "https://i0.wp.com/railsimbelgium.com/wp-content/uploads/2020/07/HLR77-1.jpg?resize=1536%2C864&ssl=1",
          description:
            "De HLR 77 is een reeks van dieselhydraulische rangeerlocomotieven van de NMBS. Er zijn 170 exemplaren geleverd. Ze waren zowel bedoeld voor de rangeerdienst als voor de goederenlijndienst, maar niet voor de reizigersdienst.",
        },
        {
          type: "LOCOMOTIVE",
          subtype: "Type 11",
          image:
            "https://yanidegrande.com/static/media/_1.98c34ffb7a95583122e0.jpeg",
          descriptionImage:
            "https://i0.wp.com/railsimbelgium.com/wp-content/uploads/2022/08/sk_hle11.png?resize=1536%2C864&ssl=1",
          description:
            "De locomotief reeks 11 is een type elektrische locomotief dat sinds 1986 werd ingezet door de NMBS. De locomotieven werden speciaal gebouwd voor het trekken/duwen van de Beneluxtreinen tussen Amsterdam Centraal en Brussel-Zuid en werden tot 2009 uitsluitend op deze verbinding ingezet. In 2009 verhuisden ze voor enige tijd naar binnenlandse Belgische treindiensten, tot ze in 2012 definitief uit dienst gehaald zijn. De locomotief reeks 12 was een type elektrische locomotief dat in 1986 werd ingezet door de NMBS. De locs werden in het tweede deel van hun carrière uitsluitend gebruikt voor het trekken van goederentreinen tussen België en Noord-Frankrijk. Vroeger deden deze locs dienst voor passagierstreinen naar Lille, maar deze ritten werden later gereden door de treinstellen type AM96. Uitzonderlijk waren ze ook te zien tussen Brussel en Parijs, bij een tekort aan reeks 15, 18 of CC40100, maar enkel in diensten die volledig door NMBS-bestuurders werden gereden.",
        },
        {
          type: "LOCOMOTIVE",
          subtype: "Type 27",
          image:
            "https://yanidegrande.com/static/media/_7.e679b913524acfaca0b4.jpeg",
          descriptionImage:
            "https://i0.wp.com/railsimbelgium.com/wp-content/uploads/2022/08/Schermopname-1015.png?resize=1536%2C864&ssl=1",
          description:
            "De locomotief reeks 27 is een type elektrische locomotief dat sinds 1981 wordt ingezet door de NMBS, voor zowel passagiers- als goederentreinen. Deze locomotieven zijn technisch bijna identiek aan de latere reeksen 11, 12 en 21. Als grootste verschil hebben deze laatste 3 reeksen slechts 2/3 van het motorvermogen van de reeks 27. De HLE 27 wordt voornamelijk ingezet op IC- en P-diensten, bijna altijd in combinatie met M4, M5 of M6-stammen. Vooral op de IC's tussen Antwerpen, Brussel en Charleroi komen ze vaak voor. De stelplaats van de HLE 27 is Kinkempois.",
        },
        {
          type: "CARRIAGE",
          subtype: "I11",
          image:
            "https://yanidegrande.com/static/media/i11.d679d8c413b99c360ff4.jpeg",
          descriptionImage:
            "https://i0.wp.com/railsimbelgium.com/wp-content/uploads/2021/12/Schermopname-808.png?resize=1536%2C864&ssl=1",
          description:
            "De I11-rijtuigen rijden sinds 1995 rond op het net van de Belgische spoorwegmaatschappij NMBS. Ze zijn gebouwd bij BN te Brugge. De rijtuigen vertonen uiterlijk sterke overeenkomsten met het tussenrijtuig van een MS96. Duidelijke verschillen zijn dat de rijtuigen van de MS96 voorzien werden met een pantograaf en niet met digitale schermpjes in de zijkanten waarop de bestemmingen worden weergegeven bij de deur (er bevinden wel schermpjes in de stuurposten). Bij de I11-rijtuigen is dit omgekeerd, geen pantograaf maar wel schermpjes.",
        },
        {
          type: "CARRIAGE",
          subtype: "M4",
          image:
            "https://yanidegrande.com/static/media/m4.27911df458f2c4e0ef07.jpeg",
          descriptionImage:
            "https://i0.wp.com/railsimbelgium.com/wp-content/uploads/2022/04/sktrains_m4.png?resize=1536%2C859&ssl=1",
          description:
            "De M4-rijtuigen zijn rijtuigen van de NMBS. De M4-rijtuigen, gebouwd in de jaren 1979-1984, zijn er in vijf varianten. Het grootste deel bestaat uit tussenrijtuigen, een deel is voorzien van stuurstand. Oorspronkelijk waren alle 580 rijtuigen bordeauxrood, maar tussen 1996 en begin 2009 werden ze gemoderniseerd. Nu rijden alle rijtuigen in new-look-livrei rond (zoals de I11).",
        },
        {
          type: "CARRIAGE",
          subtype: "M6",
          image:
            "https://yanidegrande.com/static/media/m6.7caf5b706e48847f74a8.jpeg",
          descriptionImage:
            "https://i0.wp.com/railsimbelgium.com/wp-content/uploads/2021/12/Schermopname-905.png?resize=1536%2C864&ssl=1",
          description:
            "De M6 zijn sinds 2001 dubbeldeksrijtuigen van de NMBS. Ze zijn gebouwd door Bombardier en Alstom. De eindassemblage gebeurde door Bombardier in Brugge (het vroegere BN). In de loop van 2011 zijn alle rijtuigen in dienst gekomen, wat de totale M6-vloot op 492 stuks bracht.",
        },
        {
          type: "TRAINSET",
          subtype: "MR08",
          image:
            "https://yanidegrande.com/static/media/ms08.8849573fc1c14d031514.jpeg",
          descriptionImage:
            "https://i0.wp.com/railsimbelgium.com/wp-content/uploads/2022/08/24010_20230620232124_1.png?resize=1536%2C864&ssl=1",
          description:
            "Het treinstel werd door Siemens Mobility ontwikkeld uit de Desiro MainLine (serie 460) bestemd voor het Duitse trans regio. Siemens Mobility bouwde 105 treinstellen en Bombardier Transportation 200 treinstellen. De raad van de bestuur van het Belgische nationale spoorwegbedrijf NMBS besliste om 305 elektrische motorstellen van het type 'Desiro ML' aan te kopen bij Siemens. Met een waarde van 1,291 miljard euro is dit het grootste investeringsdossier ooit voor de NMBS. De bestelde rijtuigen hebben in totaal 85.400 zitplaatsen en werden afgeleverd tussen het voorjaar van 2011 en eind 2016, in een tempo van vijf tot acht stellen per maand. Tijdens de opendeurdagen van de NMBS-werkplaatsen gedurende vijf weekends vanaf 24 september tot en met 23 oktober 2011 werden de treinstellen officieel aan het publiek voorgesteld. De NMBS vroeg op 1 oktober 2013 garanties van Siemens naar aanleiding van de wereldwijde aangekondigde personeelsaanpassingen van de Duitse multinational en of dit geen gevolgen zou hebben voor de levering en opvolging van 305 treinen aan de NMBS alsmede de kwaliteitsopvolging van 120 al geleverde locomotieven. Op 19 maart 2015 werden de treinstellen 08594 en 08595 als laatste van in totaal 305 treinstellen door Siemens Mobility afgeleverd aan NMBS.",
        },
        {
          type: "TRAINSET",
          subtype: "MS80",
          image:
            "https://yanidegrande.com/static/media/ms80.ed34406bcc160eecbca6.jpeg",
          descriptionImage:
            "https://i0.wp.com/railsimbelgium.com/wp-content/uploads/2023/08/Schermopname-1107.png?resize=1536%2C864&ssl=1",
          description:
            "De MS80 en de vervolgseries MS82 en MS83, ook wel Break genoemd, zijn elektrische treinstellen van de Belgische spoorwegmaatschappij NMBS die tussen 1981 en 1985 in dienst zijn gekomen. Ze waren oorspronkelijk tweedelig, maar zijn tussen 1992 en 1995 verlengd tot driedelige stellen door er een extra rijtuig tussen te bouwen. Tussen 2009 en 2020 werden deze stellen gemoderniseerd, waarbij ze in de grijze 'New Look'-livrei werden geschilderd en een nieuw interieur kregen. In 2020 werden 106 stellen uitgerust met ETCS, deze stellen werden ook voorzien van een nieuw deurlussysteem.",
        },
        {
          type: "TRAINSET",
          subtype: "MS96",
          image:
            "https://yanidegrande.com/static/media/ms96.9508209cf41ec98ee757.jpeg",
          descriptionImage:
            "https://i0.wp.com/railsimbelgium.com/wp-content/uploads/2022/02/Schermopname-838.png?resize=1536%2C864&ssl=1",
          description:
            "De MS96 (ook wel DMT, wat staat voor Draaistroommotor - Moteur Triphasé) is een type van elektrische treinstellen van de Belgische spoorwegmaatschappij NMBS. Ze zijn driedelig en hebben aan beide kanten een stuurpost. Ze zijn te herkennen aan het rubber aan de kopwanden; hierdoor kunnen twee, drie of vier stellen gekoppeld worden. Er is dan een doorloopmogelijkheid, de stuurpost klapt opzij om dit mogelijk te maken. De rubberneuzen zijn gebaseerd op Deense treinstellen van het type IC3.",
        },
      ],
    });
  } catch (error) {
    logger.error(error);
  }
};

const removeSeeds = async () => {
  // - Logger
  const logger = getLogger();

  logger.info(`🌱 Removing seeds`);
  const prisma = new PrismaClient();

  try {
    await prisma.trainComponent.deleteMany();
  } catch (error) {
    debugLog(error);
  }
};

module.exports = {
  seedData,
  removeSeeds,
};
