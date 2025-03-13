import pandas as pd

df = pd.read_csv("./data/crimes.csv")
covid_crimes_df = df[(df['Year'] >= 2020) & (df['Year'] <= 2023)]
covid_crimes_df = covid_crimes_df[covid_crimes_df['Latitude'].notna() & covid_crimes_df['Longitude'].notna()]
covid_crimes_df.to_csv("./data/covid_crimes.csv", index=False)