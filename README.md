# WS-WonderWhizbang
Un moteur de recherche spécialisé dans le patrimoine mondial de l'UNESCO.


# Exemples de requêtes

Nombre de sujets de type WorldHeritageSite
```sparql
SELECT (count(?site) as ?count) WHERE {
?site a dbo:WorldHeritageSite .
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
