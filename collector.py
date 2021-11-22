"""Interactive interface for Twitter Search API.
Connects to Twitter Search API and collects tweets based on keyword.
Saves collected tweets as jsonl in ./data. 
"""
import streamlit as st
import tweepy
import json
import os
import datetime
import time
import sys
from datetime import time

st.markdown("<h1 style='text-align: center; margin-top: -80px;color: blue;'>Twitter Scrapping</h1>", unsafe_allow_html=True)

credentials = []
try:
    for line in open("./twitter_apikeys.txt"):
        li=line.strip()
        if not li.startswith("#"):
            credentials.append(li)    
except FileNotFoundError:
    st.error("Please follow the above instructions to use the collector.")

a = credentials[0]
b = credentials[1]


# authenticate and initialise api
auth = tweepy.AppAuthHandler(a, b)
# auth.set_access_token(c, d)
api = tweepy.API(auth)

keywords = st.text_input("Insert keyword(s) here", value='')
 
tweets_needed = st.slider('Number to tweets to scrap', 1, 5000)

savename = keywords.replace(" ", "_")

# create directories before it's too late
datadir = "./data"
if not os.path.exists(datadir):
    os.makedirs(datadir)

datetoday = datetime.date.today()
datelastweek = datetoday - datetime.timedelta(weeks=1)
count = 0
advanced = st.checkbox("Advanced API settings")
if advanced:
    language = st.text_input("Restrict collected tweets to the given language, given by an ISO 639-1 code (leave empty for all languages)")
    timerange = st.slider("Collect tweets in the following timerange",
    		              value=(datelastweek, datetoday),
    		              min_value=datelastweek,
    		              max_value=datetoday)
    since_date = timerange[0]
    until_date = timerange[1] + datetime.timedelta(days=1)
    restype = st.radio(label="Type of result", options=["mixed (include both popular and real time results in the response)", "recent (return only the most recent results in the response)","popular (return only the most popular results in the response)"], index=0)
    restype = restype.split('(')[0]
col1, col2, col3 = st.columns(3)
with col2:

    if st.button("Start collecting"):
        if advanced:
            c = tweepy.Cursor(api.search_tweets,q=keywords,rpp=100, tweet_mode='extended', lang=language, until=until_date, result_type=restype).items()
            var = 0
            while var <= tweets_needed:
                try:
                    tweet = c.next()
                    tweet = (tweet._json)
                    tweetdatetime = datetime.datetime.strptime(tweet['created_at'], '%a %b %d %H:%M:%S +0000 %Y')
                    if tweetdatetime.date() < since_date:
                        print("Collected all the tweets in the desired timerange! Collected {count} tweets.")
                        break
                    else:
                        count += 1
                        with open (f"{datadir}/{datetoday}_tweets_{savename}.jsonl", "a", encoding = "utf-8") as f:
                            json.dump(tweet, f, ensure_ascii=False)
                            f.write("\n")

                # when you attain the rate limit:
                except tweepy.TweepyException as e:
                    st.write(f"Attained the rate limit. Going to sleep. Collected {count} tweets.")
                    # go to sleep and wait until rate limit
                    st.write("Sleeping...")
                    my_bar = st.progress(0)
                    for i in range (900):
                        time.sleep(1)
                        my_bar.progress((i+1)/900)
                    
                    continue

                # when you collected all possible tweets:
                except StopIteration:
                    st.write(f"Collected all possible {count} tweets from last week.")
                    break
                var += 1    
            # st.write(f"Collected all possible {count} tweets from last week.")
        else:                    
            c = tweepy.Cursor(api.search_tweets,q=keywords,rpp=100, tweet_mode='extended').items()
            var = 0
            while var <= tweets_needed-1:
                try:
                    tweet = c.next()
                    tweet = (tweet._json)
                    count += 1
                    with open (f"{datadir}/{datetoday}_tweets_{savename}.jsonl", "a", encoding = "utf-8") as f:
                        json.dump(tweet, f, ensure_ascii=False)
                        f.write("\n")

                # when you attain the rate limit:
                except tweepy.TweepyException as e:
                    st.write(f"Attained the rate limit. Going to sleep. Collected {count} tweets.")
                    # go to sleep and wait until rate limit
                    st.write("Sleeping...")
                    my_bar = st.progress(0)
                    for i in range (900):
                        time.sleep(1)
                        my_bar.progress((i+1)/900)
                    st.write("Collecting...")
                    continue
                
                # when you collected all possible tweets:
                except StopIteration:
                    st.write(f"Collected all possible {count} tweets from last week.")
                    break
                var += 1      

st.write(count,"tweets scrapped successfully")