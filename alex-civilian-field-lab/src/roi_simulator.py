"""Monte Carlo ROI-simulering for sivile feltlab-konsepter.

Modellerer usikkerhet i markedsstørrelse, adopsjonshastighet og
utviklingskostnad med 10 000 iterasjoner per konsept.
"""
import random
import statistics


N_ITERATIONS = 10_000
RANDOM_SEED = 42


def _triangular(low, mid, high):
    return random.triangular(low, mid, high)


def simulate_concept(concept, n=N_ITERATIONS):
    """Kjør Monte Carlo-simulering for ett konsept.

    Returnerer dict med nøkkelstatistikk: median, P10, P90, breakeven_prob.
    """
    rng = random.Random(RANDOM_SEED + hash(concept["name"]) % 10_000)

    cost_base = concept["estimated_cost"]
    pain = concept["customer_pain"]
    sales_p = concept["sales_potential"]
    ip_p = concept["ip_potential"]
    diff = concept["prototype_difficulty"]

    # Usikkerhetsspenn rundt inputs
    cost_low = cost_base * 0.8
    cost_high = cost_base * 2.5  # prototypekostnader overskrides ofte

    # Markedsstørrelse: antall potensielle kunder i Norge (grovt)
    base_customers = _customers_for_pain(pain)
    customers_low = base_customers * 0.3
    customers_high = base_customers * 3.0

    # Adopsjonsprosent første år
    adoption_low = 0.01
    adoption_mid = sales_p / 100.0 * 0.12
    adoption_high = sales_p / 100.0 * 0.35

    # Pris per enhet (NOK, ARR-ekvivalent)
    price_low = cost_base * 0.3
    price_mid = cost_base * 0.8
    price_high = cost_base * 2.0

    # IP-verdimultiplikator (lisens/exit)
    ip_mult_low = 1.0
    ip_mult_mid = 1.0 + ip_p * 0.3
    ip_mult_high = 1.0 + ip_p * 1.2

    outcomes = []
    costs = []
    for _ in range(n):
        cost = rng.triangular(cost_low, cost_base, cost_high)
        n_customers = rng.triangular(customers_low, base_customers, customers_high)
        adoption = rng.triangular(adoption_low, adoption_mid, adoption_high)
        price = rng.triangular(price_low, price_mid, price_high)
        ip_mult = rng.triangular(ip_mult_low, ip_mult_mid, ip_mult_high)

        # Justering for vanskelighetsgrad på prototypen
        difficulty_penalty = 1.0 + (diff - 5) * 0.08
        cost_adj = cost * difficulty_penalty

        revenue_y1 = n_customers * adoption * price * ip_mult
        net_y1 = revenue_y1 - cost_adj
        outcomes.append(net_y1)
        costs.append(cost_adj)

    outcomes.sort()
    p10 = outcomes[int(n * 0.10)]
    p50 = outcomes[int(n * 0.50)]
    p90 = outcomes[int(n * 0.90)]
    breakeven_prob = sum(1 for v in outcomes if v >= 0) / n
    mean_cost = statistics.mean(costs)

    return {
        "name": concept["name"],
        "domain": concept["domain"],
        "value_score": concept["value_score"],
        "estimated_cost_nok": concept["estimated_cost"],
        "sim_mean_cost_nok": round(mean_cost),
        "sim_p10_net_nok": round(p10),
        "sim_p50_net_nok": round(p50),
        "sim_p90_net_nok": round(p90),
        "breakeven_prob": round(breakeven_prob * 100, 1),
        "n_iterations": n,
    }


def _customers_for_pain(pain_score):
    """Antall potensielle kunder i Norge estimert fra smertenivå (1-10)."""
    table = {10: 50000, 9: 20000, 8: 8000, 7: 3000, 6: 1200, 5: 500, 4: 200, 3: 80, 2: 30, 1: 10}
    return table.get(int(pain_score), 500)


def simulate_roi_batch(concepts, n=N_ITERATIONS):
    """Simuler alle konsepter og returner sortert liste (best P50 øverst)."""
    results = [simulate_concept(c, n) for c in concepts]
    results.sort(key=lambda r: r["sim_p50_net_nok"], reverse=True)
    return results
