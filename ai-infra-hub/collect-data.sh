#!/bin/bash

# 数据采集脚本
# 用法：./collect-data.sh [日期]

CRON_SECRET="tjASbRVzmc46IQaySLXqdratvPng6ewclf47wFl+DE8="
BASE_URL="http://localhost:3000"

# 如果没有指定日期，使用今天
if [ -z "$1" ]; then
  TODAY=$(date +%Y-%m-%d)
  YESTERDAY=$(date -v-1d +%Y-%m-%d)
  
  echo "=== 开始采集今天 ($TODAY) 的数据 ==="
  curl -X POST "${BASE_URL}/api/cron/daily-report?date=${TODAY}&type=all" \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    --max-time 180
  
  echo -e "\n\n=== 开始采集昨天 ($YESTERDAY) 的数据 ==="
  curl -X POST "${BASE_URL}/api/cron/daily-report?date=${YESTERDAY}&type=all" \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    --max-time 180
else
  echo "=== 开始采集 $1 的数据 ==="
  curl -X POST "${BASE_URL}/api/cron/daily-report?date=${1}&type=all" \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    --max-time 180
fi

echo -e "\n\n数据采集完成！"
