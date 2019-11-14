# Generated by Django 2.2.3 on 2019-11-14 02:32

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Payinfo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('profile', models.CharField(max_length=100)),
                ('price', models.FloatField()),
                ('path', models.FilePathField()),
            ],
        ),
    ]
