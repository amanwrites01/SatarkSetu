"""Random public aliases, so reporters stay anonymous but get a stable-looking name."""
import secrets

ADJECTIVES = ["Vigilant", "Silent", "Brave", "Watchful", "Clever", "Steady", "Swift", "Wise", "Calm", "Sharp", "Bold", "Alert"]
ANIMALS = ["Owl", "Mongoose", "Falcon", "Tiger", "Heron", "Lynx", "Peacock", "Panther", "Kestrel", "Otter", "Hawk", "Fox"]


def random_alias() -> str:
    return f"{secrets.choice(ADJECTIVES)} {secrets.choice(ANIMALS)} #{secrets.randbelow(900) + 100}"
