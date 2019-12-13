file = open("words.txt", "r")
newfile = open("newwords.txt", "w")

words = []

for word in file:
    if (len(word.rstrip("\n")) > 3):
        newfile.write(word)
