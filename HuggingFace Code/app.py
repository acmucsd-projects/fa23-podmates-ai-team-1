import os
from googleapiclient.discovery import build
import pandas as pd
import numpy as np
from urllib.parse import urlparse, parse_qs
from transformers import pipeline
from transformers import AutoTokenizer
from transformers import AutoModelForSequenceClassification
from scipy.special import softmax
import gradio as gr

api_key = os.environ['api_key']
youtube_api = build('youtube','v3',developerKey=api_key)

#Get top 100 comments and make a dataframe
def get_comment_data(youtube_id):
  request = youtube_api.commentThreads().list(part="snippet", videoId= youtube_id, maxResults=100, order="relevance", textFormat="plainText")
  response = request.execute()
  comments = [[comment['snippet']['topLevelComment']['snippet']['textDisplay'], comment['snippet']['topLevelComment']['snippet']['likeCount']] for comment in response['items']]
  df = pd.DataFrame(comments, columns=['Comment_Text', 'Like_Count'])
  return df

#Get title and thumbnail
def get_vid_details(youtube_link):
  youtube_id = get_video_id(youtube_link)
  request = youtube_api.videos().list(
      part="snippet",
      id= youtube_id
  )
  response = request.execute()
  return response['items'][0]['snippet']['title'],response['items'][0]['snippet']['channelTitle'],response['items'][0]['snippet']['thumbnails']['high']['url']
    
#In case we ever want all comments
def get_all_comments(youtube_id):
  comments = [[]]
  next_page_token = None
  while True:
    request = youtube_api.commentThreads().list(part="snippet", videoId= youtube_id, maxResults=100, pageToken=next_page_token, order="relevance", textFormat="plainText")
    response = request.execute()

    for item in response['items']:
      comments.append([item['snippet']['topLevelComment']['snippet']['textDisplay'], item['snippet']['topLevelComment']['snippet']['likeCount']])

    if 'nextPageToken' in response:
        next_page_token = response['nextPageToken']
    else:
      break
  df = pd.DataFrame(comments, columns=['Comment_Text', 'Like_Count'])
  return df

#Get all videos from a creator
def get_channel_videos(channel_id):
  all_videos=[]
  # Initial request to retrieve the channel's uploaded videos
  request = youtube_api.search().list(
      part='id',
      channelId=channel_id,
      maxResults=50  # Adjust as needed
  )

  while request is not None:
      response = request.execute()

      for item in response.get('items', []):
          if item['id']['kind'] == 'youtube#video':
              all_videos.append(item['id']['videoId'])

      request = youtube_api.search().list_next(request, response)

  return all_videos

#Pass a valid youtube video url or else function will not work
def get_video_id(url):
  parsed_url = urlparse(url)
  return parse_qs(parsed_url.query)['v'][0]

#Set up the model and tokenizer
MODEL = f"cardiffnlp/twitter-roberta-base-sentiment"
MODEL2 = "SamLowe/roberta-base-go_emotions"
tokenizer = AutoTokenizer.from_pretrained(MODEL)
tokenizer2 = AutoTokenizer.from_pretrained(MODEL2)
model = AutoModelForSequenceClassification.from_pretrained(MODEL)
model2 = AutoModelForSequenceClassification.from_pretrained(MODEL2)
classifier = pipeline(task="text-classification", model="SamLowe/roberta-base-go_emotions", top_k=None)

def generate_sentiments(df, progress=gr.Progress()):
  #Set up lists to add to dataframe
  pos_sent = []
  neu_sent = []
  neg_sent = []

  feeling1 = []
  feeling2 = []
  feeling3 = []

  for comment in progress.tqdm(df['Comment_Text'],desc="Analyzing Comments"):
    #Encode the comment and run roberta on it
    tokens = tokenizer.tokenize(comment)
    if len(tokens) > 514:
      tokens = tokens[:512]
    comment = tokenizer.convert_tokens_to_string(tokens)

    model_outputs = classifier(comment)
    top_three_feelings = ""

    #Top three sentiments, RoBERTa-based model
    sentiment1 = list(model_outputs[0][0].values())[0]
    sentiment2 = list(model_outputs[0][1].values())[0]
    sentiment3 = list(model_outputs[0][2].values())[0]

    feeling1.append(sentiment1)
    feeling2.append(sentiment2)
    feeling3.append(sentiment3)

    encoded_comment = tokenizer(comment, return_tensors='pt')
    output = model(**encoded_comment)
    result = output[0][0].detach().numpy()
    #Convert the numbers to be between 0 and 1 to do analysis with it
    result = softmax(result)
    #Add results to the lists
    pos_sent.append(result[2])
    neu_sent.append(result[1])
    neg_sent.append(result[0])
  #Add sentiments to the dataframe
  new_df = df.copy()
  new_df['Positive_Sentiment'] = pos_sent
  new_df['Neural_Sentiment'] = neu_sent
  new_df['Negative_Sentiment'] = neg_sent

  new_df['Feeling 1'] = feeling1
  new_df['Feeling 2'] = feeling2
  new_df['Feeling 3'] = feeling3

  return new_df

def addWeights(df,progress=gr.Progress()):
  df1 = generate_sentiments(df,progress)
  total_weights = df1['Like_Count'].sum()
  df1['Weights'] = df1['Like_Count'] / total_weights
  return df1

def three_most_common_words(words_list):
    word_counts = {}

    # Count the occurrences of each word
    for word in words_list:
        word_counts[word] = word_counts.get(word, 0) + 1

    # Get the three most common words and their frequencies
    most_common_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)[:3]

    return [item[0] for item in most_common_words]

def getWeightSentimentAll(df, progress=gr.Progress()):
  df1 = addWeights(df,progress)
  #Start at default 0.5, add the results of positive sentiment and subtract negative sentiment
  total_sum = 0
  for value1, value2 in zip(df1['Neural_Sentiment'], df1['Weights']):
      total_sum += value1 * value2
  weighted_avg = (df1['Positive_Sentiment'] * df1['Weights']).sum() * 0.2699488 + total_sum * 0.53425314 - (df1['Negative_Sentiment'] * df1['Weights']).sum() * 0.3747967 + 0.5
  df['Weighted Average'] = weighted_avg
  
  most_common_words = three_most_common_words(list(df1['Feeling 1']) + list(df1['Feeling 2']) + list(df1['Feeling 3']))
  return str(int(weighted_avg*100)) + "%", *most_common_words

def rate(youtube_url, progress=gr.Progress()):
  try:
    vid_id = get_video_id(youtube_url)
    vid_df = get_comment_data(vid_id)
    vid_sent = getWeightSentimentAll(vid_df,progress)
    return vid_sent
  except:
    raise gr.Error("Process failed. Ensure link is a valid YouTube URL")


with gr.Blocks() as app:
  gr.Markdown("""
  # Game Review Analysis Using Youtube

  ### Insert a YouTube URL to analyze the comments and get the population's review on the game!
  """
  )
  with gr.Tab("Video Rating"):
    input = gr.Textbox(label="YouTube URL",  placeholder = "Place link here")
    output = gr.Textbox(label = "Community's Rating of the Game")
    with gr.Row():
      feeling1 = gr.Textbox(label="Top 3 Feelings")
      feeling2 = gr.Textbox(label="")
      feeling3 = gr.Textbox(label="")
    rate_btn = gr.Button("Rate!")
    rate_btn.click(fn=rate, inputs=input,outputs=[output,feeling1,feeling2,feeling3])
  with gr.Tab("Video Details"):
    input = gr.Textbox(label="Youtube URL", placeholder = "Place link here")
    title = gr.Textbox(label="Title")
    channel_name = gr.Textbox(label="Channel Name")
    thumbnail = gr.Image(label="Thumbnail")
    info_btn = gr.Button("Get Video Info!")
    info_btn.click(fn=get_vid_details, inputs=input, outputs=[title,channel_name,thumbnail])
app.launch()