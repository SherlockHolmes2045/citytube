import 'package:citytube/audio/audio.dart';
import 'package:citytube/l10n/arb/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:citytube/counter/counter.dart';
import 'package:citytube/l10n/l10n.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        appBarTheme: AppBarTheme(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        ),
        useMaterial3: true,
      ),
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: const MyApp(),
    );
  }
}
