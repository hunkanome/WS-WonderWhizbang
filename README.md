# WS-WonderWhizbang
Un moteur de recherche spécialisé dans le patrimoine historique mondial.

Vous pouvez accéder à la version en direct du projet [ici](https://hunkanome.github.io/WS-WonderWhizbang).

# Exemples de requêtes

Nombre de sujets de type WorldHeritageSite
```sparql
SELECT (count(?site) as ?count) WHERE {
?site a dbo:WorldHeritageSite .
}
```

Récupérer les informations d'un site
/!\ peut être long à charger à cause du foaf:isPrimaryTopicOf je crois
```sparql
SELECT * WHERE {
<http://dbpedia.org/resource/Calanques_de_Piana> a dbo:WorldHeritageSite;
    rdfs:label ?label.

OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> dbo:abstract ?abstract}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> rdfs:comment ?comment}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> dbo:thumbnail ?thumbnail}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> dbp:imagecaption ?imagecaption}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> foaf:depiction ?picture}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> geo:lat ?latitude}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> geo:long ?longitude}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> foaf:homepage ?homepage}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> dbp:website ?homepageAlt}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> dbp:location ?location}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> dbp:locmapin ?locationAlt}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> foaf:isPrimaryTopicOf ?wikiPage}.
OPTIONAL {<http://dbpedia.org/resource/Calanques_de_Piana> dbp:year ?year}.


FILTER (lang(?label) = "fr")
FILTER (lang(?abstract) = "fr")
FILTER (lang(?comment) = "fr")
FILTER (lang(?imagecaption) = "fr")
}
```

Liste des sites
```sparql
SELECT ?site WHERE {
?site a dbo:WorldHeritageSite .
}
```

Recherche des sites dans un pays
```sparql
SELECT ?site WHERE {
?site dbp:location <http://dbpedia.org/resource/France>;
      a dbo:WorldHeritageSite.
}
```

Images associées à un site
```sparql
SELECT ?image WHERE {
<http://dbpedia.org/resource/Calanques_de_Piana> foaf:depiction ?image.
}
```
