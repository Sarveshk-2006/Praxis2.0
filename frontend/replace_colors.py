import os

replacements = [
    ("#E8C547", "#2DD4BF"),
    ("#e8c547", "#2DD4BF"),
    ("rgba(232,197,71", "rgba(45,212,191"),
    ("rgba(232, 197, 71", "rgba(45, 212, 191"),
    ("#4DFFB4", "#818CF8"),
    ("#4dffb4", "#818CF8"),
    ("#4DA3FF", "#FB923C"), # from segments.js
    ("#4D9FFF", "#FB923C"),
    ("#0A0A0A", "#0F0E0C"),
    ("#0a0a0a", "#0F0E0C"),
    ("#111111", "#161513"),
    ("#161616", "#1C1A17"),
    ("#555555", "#8A8480"),
    ("#666666", "#8A8480"),
    ("rgba(255,255,255,0.08)", "rgba(255,255,255,0.07)"),
    ("rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.07)"),
    ("rgba(255,255,255,0.1)", "rgba(255,255,255,0.07)"),
    ("rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.07)"),
    ("rgba(255,255,255,0.15)", "rgba(255,255,255,0.14)"),
    ("rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.14)"),
    ("rgba(255,255,255,0.12)", "rgba(255,255,255,0.07)"), # extra
    ("rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.07)"),
    ("#F5F0E8", "#F0EDE8"),
    ("#f5f0e8", "#F0EDE8"),
    ("bg-[#111]", "bg-[#161513]"),
    ("#1a1a1a", "#1C1A17"),
    ("#1A1A1A", "#1C1A17"),
    ("bg-gold", "bg-[#2DD4BF]"),
    ("text-gold", "text-[#2DD4BF]"),
    ("border-gold", "border-[#2DD4BF]"),
    ("accent-gold", "accent-[#2DD4BF]"),
    ("hover:text-gold", "hover:text-[#2DD4BF]"),
    ("bg-mint", "bg-[#818CF8]"),
    ("text-mint", "text-[#818CF8]"),
    ("border-mint", "border-[#818CF8]"),
]

files_to_update = [
    'd:/Praxis2.0/frontend/src/pages/Affinity.jsx',
    'd:/Praxis2.0/frontend/src/pages/Recommend.jsx',
    'd:/Praxis2.0/frontend/src/pages/Segments.jsx',
    'd:/Praxis2.0/frontend/src/pages/Intelligence.jsx',
    'd:/Praxis2.0/frontend/src/pages/Dashboard.jsx',
    'd:/Praxis2.0/frontend/src/components/Loader.jsx',
    'd:/Praxis2.0/frontend/src/components/Navbar.jsx',
    'd:/Praxis2.0/frontend/src/components/CustomCursor.jsx'
]

for path in files_to_update:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        for old, new in replacements:
            new_content = new_content.replace(old, new)

        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {path}")
