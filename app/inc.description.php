<section id="description" class="box visible">
    <h2 class="title is-size-3-mobile has-text-warning">? What's this?</h2>
    <h3 class="subtitle">Ever wondered what's more profitable, selling raw materials or crafting and selling the product? Say no more.</h3>

    <div class="box has-background-dark">
        <p class="has-text-warning">Planned features / under development</p>

        <ul>
            <li>support for previous expansions</li>
            <li style="margin-top: 1.5em;">always interested in community ideas, so please come forward!</li>
        </ul>

        <br>

        <a class="has-text-warning" href="#changelog">Click here to view the changelog.</a>
    </div>

    <div class="content">
        <p>AuctionCraftSniper allows you to directly compare the total cost of materials with its current corresponding product buyout price, telling you what's worth crafting or sniping and what isn't.
            <br>
            <br>
            All data is taken directly from the Blizzard Auction Data API and gets updated roughly once per hour - more importantly: the page will automatically analyze the newest data if you leave the tab opened.
            <br>
            <br>
            Select your realm, the professions you'd like to inspect and an expansion level and you're ready to go!</p>
    </div>

    <figure class="image blurred">
        <img src="/assets/img/demo-light.png?<?= filemtime('assets/img/demo-light.png') ?>" alt="Demo" onload="this.parentElement.classList.remove('blurred'); this.removeAttribute('onload');">
    </figure>

    <br>

    <div class="box has-background-dark" id="changelog">
        <p class="has-text-warning">Changelog</p>

        <ul>
            <li>Expulsom worth can now automatically be calculated based on your servers economy.</li>
        </ul>

        <ul>
            <li>introduced settings for custom thresholds</li>
            <li>added alchemy proc rate</li>
        </ul>

        <br>

        <ul>
            <li>parser speed increased by around 85%</li>
            <li>sorting introduced: to sort a column, simply click on it!</li>
        </ul>

        <br>

        <ul>
            <li>heavily improved tables on mobile</li>
            <li>parser is no longer missing items (approx. 20% were ignored before)</li>
        </ul>

        <br>

        <ul>
            <li>added all missing 8.1 recipes</li>
            <li>added "unlisted"-tag to unlisted recipes & cross-linking to TUJ</li>
        </ul>

        <br>

        <ul>
            <li>currently unlisted recipes are visible the same way as lossy recipes</li>
            <li>many launch-day bugfixes</li>
        </ul>
    </div>
</section>
