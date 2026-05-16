/*
  # Seed 12 sample articles

  Inserts realistic French tech/finance articles across all 4 categories:
  - Finance & Marches: 3 articles (1 premium)
  - Crypto & Web3: 3 articles (1 premium)
  - Intelligence Artificielle: 3 articles (1 premium)
  - Cybersecurite: 3 articles (1 premium)
*/

DO $$
DECLARE
  v_author_id uuid := 'a0000000-0000-0000-0000-000000000001';
  v_finance uuid := '04fd59dd-41fe-4375-a5e1-49d5c4045abc';
  v_crypto uuid := '3ac1eb89-7b9c-4ee0-b1a3-6d4f74dfaf37';
  v_ia uuid := 'ca8428a5-e5c4-4841-b459-7c91ee0f7342';
  v_cyber uuid := '4dc7737d-fd34-4f0a-b56f-88aeda8381fb';
BEGIN
  INSERT INTO articles (title, slug, excerpt, body, cover_image, category_id, author_id, is_premium, is_published, published_at, read_time) VALUES
  (
    'La BCE maintient ses taux : quelles conséquences pour les marchés européens ?',
    'bce-maintient-taux-marches-europeens',
    'La Banque centrale européenne a annoncé le maintien de ses taux directeurs. Analyse des impacts sur les marchés actions et obligataires du continent.',
    '<p>La décision de la BCE de maintenir ses taux directeurs inchangés n''a surpris personne sur les marchés. Pourtant, les conséquences à moyen terme pourraient être plus profondes qu''il n''y paraît.</p><h2>Un statu quo attendu</h2><p>Depuis plusieurs mois, les analystes anticipaient cette décision. L''inflation en zone euro, bien qu''en recul, reste au-dessus de l''objectif de 2%. Christine Lagarde a souligné la nécessité de maintenir une politique monétaire prudente face aux incertitudes géopolitiques.</p><h2>Impact sur les marchés actions</h2><p>Le CAC 40 a réagi positivement, gagnant 0,8% dans la foulée de l''annonce. Les valeurs bancaires ont particulièrement bénéficié de cette stabilité, avec des hausses notables pour BNP Paribas (+1,2%) et Société Générale (+1,5%).</p><h2>Le marché obligataire sous tension</h2><p>Les rendements des obligations souveraines européennes ont légèrement reculé, le Bund allemand à 10 ans passant sous la barre des 2,3%. Cette détente profite aux États les plus endettés de la zone euro.</p><blockquote>« La politique de la BCE reste data-dependent. Chaque indicateur économique sera scruté avec attention lors des prochains mois. »</blockquote><p>Les investisseurs devront rester vigilants face aux prochaines publications macroéconomiques qui pourraient modifier les anticipations de marché.</p>',
    'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_finance, v_author_id, false, true, now() - interval '2 hours', 7
  ),
  (
    'ETF européens : le guide complet pour investir en 2026',
    'etf-europeens-guide-investir-2026',
    'Les ETF continuent leur percée en Europe. Notre analyse exclusive des meilleures opportunités pour construire un portefeuille performant cette année.',
    '<p>Le marché des ETF en Europe a franchi la barre des 2 000 milliards d''euros d''encours sous gestion. Cette croissance spectaculaire reflète un changement profond dans les habitudes d''investissement.</p><h2>Pourquoi les ETF dominent</h2><p>Les frais réduits, la transparence et la facilité d''accès expliquent le succès des ETF. En moyenne, un ETF actions européen affiche des frais de gestion de 0,15%, contre 1,5% pour un fonds actif traditionnel.</p><h2>Les secteurs à surveiller</h2><ul><li><strong>Intelligence artificielle</strong> — Les ETF thématiques IA affichent des performances remarquables</li><li><strong>Transition énergétique</strong> — Les fonds ESG et cleantech continuent d''attirer les capitaux</li><li><strong>Défense européenne</strong> — Un nouveau segment en forte croissance</li></ul><h2>Notre sélection</h2><p>Nous avons analysé plus de 200 ETF disponibles sur le marché européen pour identifier les plus pertinents selon différents profils de risque.</p><blockquote>« L''investissement passif n''est pas synonyme d''investissement paresseux. Le choix des ETF et l''allocation restent des décisions actives. »</blockquote>',
    'https://images.pexels.com/photos/6120214/pexels-photo-6120214.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_finance, v_author_id, true, true, now() - interval '1 day', 12
  ),
  (
    'Résultats trimestriels : LVMH dépasse les attentes des analystes',
    'lvmh-resultats-trimestriels-depassent-attentes',
    'Le géant du luxe affiche une croissance organique de 14% sur le trimestre, portée par l''Asie et les États-Unis.',
    '<p>LVMH a publié des résultats trimestriels supérieurs aux attentes du consensus, avec un chiffre d''affaires de 23,7 milliards d''euros, en hausse de 14% en données organiques.</p><h2>L''Asie comme moteur de croissance</h2><p>La région Asie-Pacifique reste le premier contributeur à la croissance du groupe, avec une progression de 18%. La Chine montre des signes de reprise solides.</p><h2>Le segment Mode et Maroquinerie en tête</h2><p>Louis Vuitton et Dior continuent de porter la division phare du groupe, qui représente désormais 49% du chiffre d''affaires total. La stratégie de montée en gamme porte ses fruits.</p><p>Le titre a gagné 3,2% en séance suite à cette publication, portant la capitalisation boursière du groupe au-delà des 450 milliards d''euros.</p>',
    'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_finance, v_author_id, false, true, now() - interval '3 days', 6
  ),
  (
    'Bitcoin franchit les 100 000$ : analyse technique et perspectives',
    'bitcoin-franchit-100000-analyse-perspectives',
    'Le Bitcoin a franchi la barre symbolique des 100 000 dollars. Décryptage des facteurs techniques et fondamentaux derrière ce mouvement historique.',
    '<p>Le Bitcoin a officiellement franchi le seuil des 100 000 dollars, un événement historique qui marque une étape majeure dans l''adoption des cryptomonnaies.</p><h2>Les catalyseurs du rallye</h2><ul><li><strong>Les ETF Bitcoin spot</strong> — Les flux entrants cumulés dépassent les 50 milliards de dollars</li><li><strong>Le halving</strong> — La réduction de l''offre pèse sur l''équilibre offre-demande</li><li><strong>L''adoption institutionnelle</strong> — Les trésoreries d''entreprises allouent une part croissante au Bitcoin</li></ul><h2>Analyse technique</h2><p>Le franchissement des 100 000$ ouvre la voie vers des objectifs ambitieux. Le prochain niveau de résistance majeur se situe autour des 120 000$, tandis que le support immédiat est à 92 000$.</p><blockquote>« 100 000$ n''est qu''une étape. La vraie question est de savoir si Bitcoin deviendra une réserve de valeur institutionnelle à part entière. »</blockquote>',
    'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_crypto, v_author_id, false, true, now() - interval '5 hours', 8
  ),
  (
    'DeFi 3.0 : la nouvelle vague de la finance décentralisée',
    'defi-3-nouvelle-vague-finance-decentralisee',
    'Après les excès de 2021 et la purge de 2022-2023, la DeFi revient avec des protocoles plus matures et une meilleure gestion du risque.',
    '<p>La finance décentralisée entre dans une nouvelle ère. Les protocoles de troisième génération corrigent les erreurs du passé tout en ouvrant de nouvelles possibilités.</p><h2>Qu''est-ce que la DeFi 3.0 ?</h2><p>Contrairement aux premières itérations, la DeFi 3.0 met l''accent sur la durabilité des rendements, la gestion des risques et la conformité réglementaire.</p><h2>Les protocoles à surveiller</h2><p>Plusieurs projets se distinguent par leur approche innovante. Les protocoles de prêt de nouvelle génération offrent des taux ajustés au risque plus réalistes, tandis que les DEX rivalisent avec les plateformes centralisées.</p><h2>Les défis à venir</h2><p>La réglementation reste le principal enjeu. Le cadre MiCA en Europe pourrait soit accélérer soit freiner l''adoption de la DeFi.</p>',
    'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_crypto, v_author_id, true, true, now() - interval '2 days', 10
  ),
  (
    'Ethereum face à la concurrence : Solana et les L2 redessinent le paysage',
    'ethereum-concurrence-solana-l2-paysage',
    'L''écosystème blockchain se diversifie. Ethereum conserve-t-il son avance face à Solana et à la montée des solutions Layer 2 ?',
    '<p>Le marché des smart contracts n''a jamais été aussi compétitif. Si Ethereum reste dominant, son hégémonie est contestée.</p><h2>Solana : le challenger sérieux</h2><p>Avec des temps de transaction inférieurs à la seconde et des frais quasi nuls, Solana s''est imposée comme l''alternative la plus crédible à Ethereum.</p><h2>La galaxie des L2</h2><p>Arbitrum, Optimism, Base, zkSync... les solutions Layer 2 se multiplient et captent une part croissante de l''activité. Ensemble, elles traitent désormais plus de transactions que le réseau principal.</p>',
    'https://images.pexels.com/photos/8370747/pexels-photo-8370747.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_crypto, v_author_id, false, true, now() - interval '4 days', 9
  ),
  (
    'GPT-5 et au-delà : la course à l''AGI s''accélère',
    'gpt5-course-agi-accelere',
    'OpenAI, Google DeepMind, Anthropic... les géants de l''IA poussent les limites du possible. État des lieux de la course vers l''intelligence artificielle générale.',
    '<p>La compétition entre les laboratoires d''intelligence artificielle n''a jamais été aussi intense. La question de l''AGI n''est plus de la science-fiction.</p><h2>Les avancées récentes</h2><p>Les derniers modèles démontrent des capacités de raisonnement, de planification et de résolution de problèmes inédites. La capacité à raisonner sur des problèmes complexes progresse à un rythme exponentiel.</p><h2>Les enjeux de sécurité</h2><p>À mesure que les systèmes d''IA deviennent plus capables, les questions de sécurité et d''alignement prennent une importance critique.</p><blockquote>« Nous ne sommes plus à l''ère des chatbots. Nous construisons des systèmes qui peuvent raisonner, planifier et agir de manière autonome. »</blockquote><h2>Impact sur l''économie</h2><p>McKinsey estime que l''IA générative pourrait ajouter entre 2 600 et 4 400 milliards de dollars à l''économie mondiale chaque année.</p>',
    'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_ia, v_author_id, false, true, now() - interval '6 hours', 11
  ),
  (
    'L''IA en entreprise : comment les grands groupes français transforment leurs opérations',
    'ia-entreprise-grands-groupes-francais-transformation',
    'De TotalEnergies à Carrefour, les entreprises du CAC 40 investissent massivement dans l''IA. Enquête sur les cas d''usage les plus prometteurs.',
    '<p>L''intelligence artificielle n''est plus un projet pilote dans les grandes entreprises françaises. Elle est devenue un outil stratégique déployé à grande échelle.</p><h2>TotalEnergies : l''IA pour la transition</h2><p>Le géant de l''énergie utilise des modèles de machine learning pour optimiser ses opérations de maintenance prédictive. Les résultats sont significatifs : une réduction de 15% des coûts de maintenance.</p><h2>Carrefour : la révolution du retail</h2><p>Le distributeur a déployé l''IA dans la gestion de ses stocks, la personnalisation des offres et l''optimisation de sa chaîne logistique.</p><h2>Les freins à l''adoption</h2><p>Malgré ces succès, plusieurs obstacles persistent : la pénurie de talents, la qualité des données et les préoccupations éthiques restent des défis majeurs.</p>',
    'https://images.pexels.com/photos/7567565/pexels-photo-7567565.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_ia, v_author_id, true, true, now() - interval '1 day 6 hours', 9
  ),
  (
    'Mistral AI lève 1 milliard : la pépite française qui défie les géants',
    'mistral-ai-leve-milliard-pepite-francaise',
    'La startup française Mistral AI confirme son statut de champion européen de l''IA avec une levée de fonds record.',
    '<p>Mistral AI vient de boucler un nouveau tour de table d''un milliard d''euros, valorisant la startup parisienne à plus de 6 milliards d''euros.</p><h2>Une ascension fulgurante</h2><p>Fondée en 2023, Mistral AI est devenue en un temps record le porte-étendard de l''IA européenne. Ses modèles open source et commerciaux rivalisent avec ceux des géants américains.</p><h2>La stratégie de Mistral</h2><p>Contrairement à OpenAI, Mistral mise sur un modèle hybride : des modèles open source pour la communauté et des offres commerciales premium pour les entreprises.</p>',
    'https://images.pexels.com/photos/8849295/pexels-photo-8849295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_ia, v_author_id, false, true, now() - interval '3 days 4 hours', 6
  ),
  (
    'Cyberattaques en France : le bilan alarmant de 2025 et les leçons pour 2026',
    'cyberattaques-france-bilan-2025-lecons-2026',
    'Les cyberattaques contre les entreprises françaises ont explosé en 2025. Analyse des tendances et recommandations pour se protéger.',
    '<p>L''année 2025 a été marquée par une recrudescence sans précédent des cyberattaques en France.</p><h2>Les chiffres clés</h2><p>Selon l''ANSSI, le nombre d''incidents signalés a augmenté de 45% par rapport à 2024. Le coût total estimé dépasse les 2 milliards d''euros.</p><h2>Les nouveaux vecteurs d''attaque</h2><p>L''IA générative est utilisée par les attaquants pour créer des campagnes de phishing ultra-réalistes et des malwares polymorphes. Les deepfakes vocaux sont devenus un outil redoutable.</p><h2>Se protéger en 2026</h2><p>Les recommandations de l''ANSSI mettent l''accent sur la formation des collaborateurs, l''authentification multi-facteurs et la mise en place de plans de réponse aux incidents.</p>',
    'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_cyber, v_author_id, false, true, now() - interval '8 hours', 10
  ),
  (
    'Zero Trust : pourquoi cette architecture s''impose en entreprise',
    'zero-trust-architecture-impose-entreprise',
    'Le modèle Zero Trust révolutionne la sécurité des systèmes d''information. Décryptage d''une approche qui ne fait plus confiance à personne.',
    '<p>L''architecture Zero Trust est passée du concept théorique à la réalité opérationnelle.</p><h2>Le principe fondamental</h2><p>Le Zero Trust repose sur un principe simple mais radical : ne jamais faire confiance, toujours vérifier. Chaque accès doit être authentifié, autorisé et chiffré.</p><h2>Mise en oeuvre pratique</h2><p>La transition implique la microsegmentation du réseau, l''authentification continue des utilisateurs, le contrôle d''accès basé sur le contexte et la surveillance en temps réel.</p><h2>Retour d''expérience</h2><p>Les entreprises ayant adopté le Zero Trust rapportent une réduction de 50% des violations de données dans les 18 mois suivant le déploiement.</p>',
    'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_cyber, v_author_id, true, true, now() - interval '2 days 8 hours', 8
  ),
  (
    'NIS2 : la nouvelle directive européenne qui change la donne pour les entreprises',
    'nis2-directive-europeenne-change-donne-entreprises',
    'La directive NIS2 entre en application et impose de nouvelles obligations de cybersécurité à des milliers d''entreprises européennes.',
    '<p>La directive NIS2 est entrée en vigueur et son impact sur le tissu économique européen est considérable.</p><h2>Qui est concerné ?</h2><p>NIS2 élargit considérablement le périmètre. Au-delà des opérateurs d''importance vitale, sont désormais concernés les fournisseurs de services numériques et les entreprises de taille intermédiaire dans les secteurs critiques.</p><h2>Les obligations clés</h2><p>Les entités concernées doivent mettre en place des mesures de gestion des risques, notifier les incidents dans les 24 heures, assurer la sécurité de leur chaîne d''approvisionnement et former régulièrement leurs employés.</p><p>Les sanctions peuvent atteindre 10 millions d''euros ou 2% du chiffre d''affaires mondial.</p>',
    'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    v_cyber, v_author_id, false, true, now() - interval '5 days', 7
  )
  ON CONFLICT (slug) DO NOTHING;
END $$;
