---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
layout: "sps"

# Основні текстові блоки
label: "Автономна СЕС"
description: "Введіть опис продукту тут..."

# Показники (Specs)
price_from: "yes"
price: 0
currency: "$"
efficiency: "0%"
rating: 5.0
attribute_1: ""
attribute_2: ""
attribute_3: ""

# Зображення
image: "/images/products/placeholder.png"
image_alt: "Опис зображення для SEO"

# Картки переваг (нижній ряд)
# Ви можете додавати або видаляти елементи з цього списку
features:
  - title: "Якість рівня A100"
    text: "Короткий опис переваги..."
    icon: "zap"
    color: "amber"
  - title: "Гарантія"
    text: "Умови гарантії..."
    icon: "shield-check"
    color: "blue"
  - title: "Сервіс"
    text: "Опис сервісного обслуговування..."
    icon: "leaf"
    color: "green"
---