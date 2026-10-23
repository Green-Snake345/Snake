#!/bin/bash
while true; do
    echo "[$(date)] Запуск игры"
    python3 main.py
    echo "[$(date)] Игра упала. Перезапуск через 5 секунд"
    sleep 5
done
