package com.smartcity.energy.service;

import com.smartcity.energy.repository.EnergyDailySummaryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class EnergyAnalyticsService {
    private final EnergyDailySummaryRepository repo;
    private final double priceGridPerKwh;
    private final double priceSolarPerKwh;
    private final double emissionFactorKgPerKwh;

    public EnergyAnalyticsService(
        EnergyDailySummaryRepository repo,
        @Value("${energy.priceGridPerKwh:1500}") double priceGridPerKwh,
        @Value("${energy.priceSolarPerKwh:0}") double priceSolarPerKwh,
        @Value("${energy.emissionFactorKgPerKwh:0.8}") double emissionFactorKgPerKwh
    ) {
        this.repo = repo;
        this.priceGridPerKwh = priceGridPerKwh;
        this.priceSolarPerKwh = priceSolarPerKwh;
        this.emissionFactorKgPerKwh = emissionFactorKgPerKwh;
    }

    private String todayKey() {
        return LocalDate.now(ZoneId.of("Asia/Jakarta")).toString(); // yyyy-MM-dd
    }

    public long calculateTodaySavingsInRp() {
        String date = todayKey();
        double solarKwh = repo.getTotalKwh(date, "SOLAR");
        double gridKwh = repo.getTotalKwh(date, "GRID");
        double biayaTanpaSolar = (gridKwh + solarKwh) * priceGridPerKwh;
        double biayaAktual = (gridKwh * priceGridPerKwh) + (solarKwh * priceSolarPerKwh);
        double penghematan = biayaTanpaSolar - biayaAktual;
        return Math.round(Math.max(0, penghematan));
    }

    public long getRealtimeGridCostInRp() {
        String date = todayKey();
        double gridKwh = repo.getTotalKwh(date, "GRID");
        return Math.round(gridKwh * priceGridPerKwh);
    }

    public double getRealtimeEmissionsKg() {
        String date = todayKey();
        double gridKwh = repo.getTotalKwh(date, "GRID");
        return gridKwh * emissionFactorKgPerKwh;
    }

    // For charts: return pair of grid/solar kWh for given date or range. Example method:
    public double[] getDailyTotals(String date) {
        double solar = repo.getTotalKwh(date, "SOLAR");
        double grid = repo.getTotalKwh(date, "GRID");
        return new double[]{grid, solar};
    }
}
