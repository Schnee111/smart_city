package com.smartcity.energy.dto;

import java.math.BigDecimal;

public class HourlyStatsResponse {
    private int hour;
    private String timeLabel;
    private BigDecimal totalKwh;
    private BigDecimal solarKwh;
    private BigDecimal gridKwh;
    private int readingCount;

    public HourlyStatsResponse() {}

    public HourlyStatsResponse(int hour, String timeLabel, BigDecimal totalKwh, 
                               BigDecimal solarKwh, BigDecimal gridKwh, int readingCount) {
        this.hour = hour;
        this.timeLabel = timeLabel;
        this.totalKwh = totalKwh;
        this.solarKwh = solarKwh;
        this.gridKwh = gridKwh;
        this.readingCount = readingCount;
    }

    // Getters and setters
    public int getHour() { return hour; }
    public void setHour(int hour) { this.hour = hour; }

    public String getTimeLabel() { return timeLabel; }
    public void setTimeLabel(String timeLabel) { this.timeLabel = timeLabel; }

    public BigDecimal getTotalKwh() { return totalKwh; }
    public void setTotalKwh(BigDecimal totalKwh) { this.totalKwh = totalKwh; }

    public BigDecimal getSolarKwh() { return solarKwh; }
    public void setSolarKwh(BigDecimal solarKwh) { this.solarKwh = solarKwh; }

    public BigDecimal getGridKwh() { return gridKwh; }
    public void setGridKwh(BigDecimal gridKwh) { this.gridKwh = gridKwh; }

    public int getReadingCount() { return readingCount; }
    public void setReadingCount(int readingCount) { this.readingCount = readingCount; }
}
